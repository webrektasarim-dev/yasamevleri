import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Apartment from "@/models/Apartment";
import Dues from "@/models/Dues";
import Payment from "@/models/Payment";
import Reservation from "@/models/Reservation";
import Announcement from "@/models/Announcement";
import SMSVerification from "@/models/SMSVerification";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

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

    const results: any = {
      users: 0,
      apartments: 0,
      dues: 0,
      payments: 0,
      reservations: 0,
      announcements: 0,
      smsVerifications: 0,
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
      ]);
    }

    // Helper function to remove _id and create new documents
    const removeIds = (items: any[]) => {
      return items.map(item => {
        const { _id, __v, ...rest } = item;
        return rest;
      });
    };

    // Import data - Remove _id to avoid duplicates
    if (data.apartments && Array.isArray(data.apartments)) {
      const apartmentsToFilter = mode === 'merge'
        ? await filterDuplicateApartments(data.apartments)
        : data.apartments;
      
      if (apartmentsToFilter.length > 0) {
        const apartmentsData = removeIds(apartmentsToFilter);
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
      const usersToFilter = await filterDuplicateUsers(data.users);
      
      if (usersToFilter.length > 0) {
        const usersData = removeIds(usersToFilter);
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
      const duesData = removeIds(data.dues);
      const dues = await Dues.insertMany(duesData);
      results.dues = dues.length;
    }

    if (data.payments && Array.isArray(data.payments)) {
      const paymentsData = removeIds(data.payments);
      const payments = await Payment.insertMany(paymentsData);
      results.payments = payments.length;
    }

    if (data.reservations && Array.isArray(data.reservations)) {
      const reservationsData = removeIds(data.reservations);
      const reservations = await Reservation.insertMany(reservationsData);
      results.reservations = reservations.length;
    }

    if (data.announcements && Array.isArray(data.announcements)) {
      const announcementsData = removeIds(data.announcements);
      const announcements = await Announcement.insertMany(announcementsData);
      results.announcements = announcements.length;
    }

    if (data.smsVerifications && Array.isArray(data.smsVerifications)) {
      const smsData = removeIds(data.smsVerifications);
      const smsVerifications = await SMSVerification.insertMany(smsData);
      results.smsVerifications = smsVerifications.length;
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

async function filterDuplicateUsers(users: any[]) {
  // Mevcut tüm email ve telefon numaralarını al
  const existingUsers = await User.find({}, 'email phone').lean();
  const emailSet = new Set(existingUsers.map(u => u.email));
  const phoneSet = new Set(existingUsers.map(u => u.phone));
  
  // Yedek dosyasındaki kullanıcıları filtrele (email veya telefon çakışırsa atla)
  const filteredUsers = users.filter(user => {
    const emailExists = emailSet.has(user.email);
    const phoneExists = phoneSet.has(user.phone);
    return !emailExists && !phoneExists;
  });
  
  console.log(`Filtered out ${users.length - filteredUsers.length} duplicate users (email or phone)`);
  
  return filteredUsers;
}

async function filterDuplicateApartments(apartments: any[]) {
  // Mevcut daireleri al (blockNumber + apartmentNumber unique)
  const existingApartments = await Apartment.find({}, 'blockNumber apartmentNumber').lean();
  const apartmentSet = new Set(
    existingApartments.map(a => `${a.blockNumber}-${a.apartmentNumber}`)
  );
  
  // Yedek dosyasındaki daireleri filtrele
  const filteredApartments = apartments.filter(
    apt => !apartmentSet.has(`${apt.blockNumber}-${apt.apartmentNumber}`)
  );
  
  console.log(`Filtered out ${apartments.length - filteredApartments.length} duplicate apartments`);
  
  return filteredApartments;
}

