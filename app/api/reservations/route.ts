import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

// GET reservations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const facilityType = searchParams.get("facilityType");
    const userId = searchParams.get("userId");
    const myOnly = searchParams.get("myOnly"); // Sadece kendi rezervasyonlarım
    const isAdmin = (session.user as any)?.role === "admin";

    await dbConnect();

    const query: any = {};

    if (facilityType) {
      query.facilityType = facilityType;
    }

    // Kullanıcılar varsayılan olarak TÜM rezervasyonları görebilir (takvim için)
    // Ama myOnly=true ise sadece kendi rezervasyonlarını gösterir
    if (!isAdmin && myOnly === "true") {
      query.userId = (session.user as any).id;
    } else if (userId) {
      query.userId = userId;
    }

    const reservations = await Reservation.find(query)
      .populate("userId", "firstName lastName email")
      .sort({ startTime: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Get reservations error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST create reservation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { facilityType, title, startTime, endTime, notes } = body;

    if (!facilityType || !title || !startTime || !endTime) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Eksik bilgi" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check for conflicts
    const conflict = await Reservation.findOne({
      facilityType,
      status: { $ne: "cancelled" },
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
        },
      ],
    });

    if (conflict) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Bu zaman dilimi için başka bir rezervasyon mevcut" },
        { status: 400 }
      );
    }

    const reservation = await Reservation.create({
      userId: (session.user as any).id,
      facilityType,
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      notes,
      status: "pending",
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: reservation,
      message: "Rezervasyon oluşturuldu",
    });
  } catch (error: any) {
    console.error("Create reservation error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}





