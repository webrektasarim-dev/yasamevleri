import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { data, mode = 'replace' } = body; // mode: 'replace' or 'merge'

    if (!data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Yedek verisi bulunamadı" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Dynamic import models to avoid build-time issues
    const [User, Apartment, Dues, Payment, Reservation, Announcement, SMSVerification, Settings] = await Promise.all([
      import("@/models/User").then(m => m.default),
      import("@/models/Apartment").then(m => m.default),
      import("@/models/Dues").then(m => m.default),
      import("@/models/Payment").then(m => m.default),
      import("@/models/Reservation").then(m => m.default),
      import("@/models/Announcement").then(m => m.default),
      import("@/models/SMSVerification").then(m => m.default),
      import("@/models/Settings").then(m => m.default),
    ]);

    const results: any = {
      users: 0,
      apartments: 0,
      dues: 0,
      payments: 0,
      reservations: 0,
      announcements: 0,
      smsVerifications: 0,
      settings: 0,
    };

    // If mode is 'replace', clear existing data first
    if (mode === 'replace') {
      await Promise.all([
        SMSVerification.deleteMany({}),
        Payment.deleteMany({}),
        Reservation.deleteMany({}),
        Announcement.deleteMany({}),
        Dues.deleteMany({}),
        User.deleteMany({ role: { $ne: 'admin' } }), // Keep current admin
        Apartment.deleteMany({}),
        Settings.deleteMany({}), // Clear settings too
      ]);
    }

    // Helper function to clean documents (only remove __v, keep _id for relationships)
    const cleanDocs = (items: any[]) => {
      return items.map(item => {
        const { __v, ...rest } = item;
        return rest;
      });
    };

    // Import data - Keep _id to preserve relationships
    // Order is important: apartments first, then users (because users reference apartments)
    if (data.apartments && Array.isArray(data.apartments)) {
      const apartmentsToFilter = mode === 'merge'
        ? await filterDuplicateApartments(data.apartments, Apartment)
        : data.apartments;
      
      if (apartmentsToFilter.length > 0) {
        const apartmentsData = cleanDocs(apartmentsToFilter);
        try {
          const apartments = await Apartment.insertMany(apartmentsData, { ordered: false });
          results.apartments = apartments.length;
        } catch (error: any) {
          // If some apartments failed due to duplicates, count successful ones
          if (error.writeErrors) {
            results.apartments = error.insertedDocs?.length || 0;
          } else {
            throw error;
          }
        }
      }
    }

    if (data.users && Array.isArray(data.users)) {
      // Always filter out duplicate emails (both modes)
      const usersToFilter = await filterDuplicateUsers(data.users, User);
      
      if (usersToFilter.length > 0) {
        const usersData = cleanDocs(usersToFilter);
        try {
          const users = await User.insertMany(usersData, { ordered: false });
          results.users = users.length;
        } catch (error: any) {
          // If some users failed due to duplicate emails, count successful ones
          if (error.writeErrors) {
            results.users = error.insertedDocs?.length || 0;
          } else {
            throw error;
          }
        }
      }
    }

    if (data.dues && Array.isArray(data.dues)) {
      const duesData = cleanDocs(data.dues);
      const dues = await Dues.insertMany(duesData, { ordered: false });
      results.dues = dues.length;
    }

    if (data.payments && Array.isArray(data.payments)) {
      const paymentsData = cleanDocs(data.payments);
      const payments = await Payment.insertMany(paymentsData, { ordered: false });
      results.payments = payments.length;
    }

    if (data.reservations && Array.isArray(data.reservations)) {
      const reservationsData = cleanDocs(data.reservations);
      const reservations = await Reservation.insertMany(reservationsData, { ordered: false });
      results.reservations = reservations.length;
    }

    if (data.announcements && Array.isArray(data.announcements)) {
      const announcementsData = cleanDocs(data.announcements);
      const announcements = await Announcement.insertMany(announcementsData, { ordered: false });
      results.announcements = announcements.length;
    }

    if (data.smsVerifications && Array.isArray(data.smsVerifications)) {
      const smsData = cleanDocs(data.smsVerifications);
      const smsVerifications = await SMSVerification.insertMany(smsData, { ordered: false });
      results.smsVerifications = smsVerifications.length;
    }

    if (data.settings && Array.isArray(data.settings)) {
      const settingsData = cleanDocs(data.settings);
      // Use upsert for settings to avoid duplicates by type
      for (const setting of settingsData) {
        const { _id, ...settingWithoutId } = setting;
        await Settings.findOneAndUpdate(
          { type: setting.type },
          settingWithoutId,
          { upsert: true, new: true }
        );
      }
      results.settings = settingsData.length;
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: results,
      message: "Yedek başarıyla geri yüklendi",
    });
  } catch (error: any) {
    console.error("Backup import error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Yedek geri yüklenemedi" },
      { status: 500 }
    );
  }
}

async function filterDuplicateUsers(users: any[], UserModel: any) {
  // Mevcut tüm email ve telefon numaralarını al
  const existingUsers = await UserModel.find({}, 'email phone').lean();
  const emailSet = new Set(existingUsers.map((u: any) => u.email));
  const phoneSet = new Set(existingUsers.map((u: any) => u.phone));
  
  // Yedek dosyasındaki kullanıcıları filtrele (email veya telefon çakışırsa atla)
  const filteredUsers = users.filter(user => {
    const emailExists = emailSet.has(user.email);
    const phoneExists = phoneSet.has(user.phone);
    return !emailExists && !phoneExists;
  });
  
  console.log(`Filtered out ${users.length - filteredUsers.length} duplicate users (email or phone)`);
  
  return filteredUsers;
}

async function filterDuplicateApartments(apartments: any[], ApartmentModel: any) {
  // Mevcut daireleri al (blockNumber + apartmentNumber unique)
  const existingApartments = await ApartmentModel.find({}, 'blockNumber apartmentNumber').lean();
  const apartmentSet = new Set(
    existingApartments.map((a: any) => `${a.blockNumber}-${a.apartmentNumber}`)
  );
  
  // Yedek dosyasındaki daireleri filtrele
  const filteredApartments = apartments.filter(
    apt => !apartmentSet.has(`${apt.blockNumber}-${apt.apartmentNumber}`)
  );
  
  console.log(`Filtered out ${apartments.length - filteredApartments.length} duplicate apartments`);
  
  return filteredApartments;
}

