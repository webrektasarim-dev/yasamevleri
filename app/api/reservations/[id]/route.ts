import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

// GET single reservation
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const reservation = await Reservation.findById(params.id).populate(
      "userId",
      "firstName lastName email"
    );

    if (!reservation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Rezervasyon bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error("Get reservation error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT update reservation
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const isAdmin = (session.user as any)?.role === "admin";

    await dbConnect();

    const reservation = await Reservation.findById(params.id);

    if (!reservation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Rezervasyon bulunamadı" },
        { status: 404 }
      );
    }

    // Only admin or owner can update
    if (!isAdmin && reservation.userId.toString() !== (session.user as any).id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedReservation,
      message: "Rezervasyon güncellendi",
    });
  } catch (error: any) {
    console.error("Update reservation error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE reservation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isAdmin = (session.user as any)?.role === "admin";

    await dbConnect();

    const reservation = await Reservation.findById(params.id);

    if (!reservation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Rezervasyon bulunamadı" },
        { status: 404 }
      );
    }

    // Only admin or owner can delete
    if (!isAdmin && reservation.userId.toString() !== (session.user as any).id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    await Reservation.findByIdAndDelete(params.id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Rezervasyon silindi",
    });
  } catch (error) {
    console.error("Delete reservation error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}






