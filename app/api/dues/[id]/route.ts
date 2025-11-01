import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Dues from "@/models/Dues";
import { ApiResponse } from "@/types";

// GET single dues
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

    const dues = await Dues.findById(params.id).populate(
      "apartmentId",
      "blockNumber apartmentNumber floor"
    );

    if (!dues) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Aidat bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: dues,
    });
  } catch (error) {
    console.error("Get dues error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT update dues
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

    const dues = await Dues.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!dues) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Aidat bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: dues,
      message: "Aidat güncellendi",
    });
  } catch (error: any) {
    console.error("Update dues error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE dues
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

    const dues = await Dues.findByIdAndDelete(params.id);

    if (!dues) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Aidat bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Aidat silindi",
    });
  } catch (error) {
    console.error("Delete dues error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}






