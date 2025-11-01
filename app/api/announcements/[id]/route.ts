import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

// PUT update announcement
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    await dbConnect();

    const announcement = await Announcement.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!announcement) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Duyuru bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: announcement,
      message: "Duyuru güncellendi",
    });
  } catch (error: any) {
    console.error("Update announcement error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE announcement
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const announcement = await Announcement.findByIdAndDelete(params.id);

    if (!announcement) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Duyuru bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Duyuru silindi",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}






