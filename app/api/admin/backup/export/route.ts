import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
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

    // Fetch all data from collections
    const [users, apartments, dues, payments, reservations, announcements, smsVerifications, settings] = await Promise.all([
      User.find({}).lean(),
      Apartment.find({}).lean(),
      Dues.find({}).lean(),
      Payment.find({}).lean(),
      Reservation.find({}).lean(),
      Announcement.find({}).lean(),
      SMSVerification.find({}).lean(),
      Settings.find({}).lean(),
    ]);

    // Create backup object
    const backup = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportedBy: (session.user as any)?.email,
        version: "1.0",
        collections: {
          users: users.length,
          apartments: apartments.length,
          dues: dues.length,
          payments: payments.length,
          reservations: reservations.length,
          announcements: announcements.length,
          smsVerifications: smsVerifications.length,
          settings: settings.length,
        },
      },
      data: {
        users,
        apartments,
        dues,
        payments,
        reservations,
        announcements,
        smsVerifications,
        settings,
      },
    };

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `backup-${timestamp}.json`;

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Backup export error:", error);
    return NextResponse.json(
      { success: false, error: "Yedekleme oluşturulamadı" },
      { status: 500 }
    );
  }
}

