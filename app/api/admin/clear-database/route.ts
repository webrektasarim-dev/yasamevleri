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
import Settings from "@/models/Settings";
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
    const { confirmText } = body;

    // Güvenlik için doğrulama
    if (confirmText !== "TEMİZLE") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Doğrulama metni hatalı" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Mevcut admin kullanıcının bilgilerini sakla
    const currentAdmin = await User.findOne({ email: (session.user as any)?.email });

    const results = {
      smsVerifications: 0,
      payments: 0,
      reservations: 0,
      announcements: 0,
      dues: 0,
      users: 0,
      apartments: 0,
      settings: 0,
    };

    // Tüm koleksiyonları temizle
    const smsResult = await SMSVerification.deleteMany({});
    results.smsVerifications = smsResult.deletedCount || 0;

    const paymentResult = await Payment.deleteMany({});
    results.payments = paymentResult.deletedCount || 0;

    const reservationResult = await Reservation.deleteMany({});
    results.reservations = reservationResult.deletedCount || 0;

    const announcementResult = await Announcement.deleteMany({});
    results.announcements = announcementResult.deletedCount || 0;

    const duesResult = await Dues.deleteMany({});
    results.dues = duesResult.deletedCount || 0;

    // Admin dışındaki tüm kullanıcıları sil
    const userResult = await User.deleteMany({ role: { $ne: 'admin' } });
    results.users = userResult.deletedCount || 0;

    const apartmentResult = await Apartment.deleteMany({});
    results.apartments = apartmentResult.deletedCount || 0;

    const settingsResult = await Settings.deleteMany({});
    results.settings = settingsResult.deletedCount || 0;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: results,
      message: "Test verileri başarıyla temizlendi",
    });
  } catch (error: any) {
    console.error("Clear database error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Veritabanı temizlenemedi" },
      { status: 500 }
    );
  }
}

