import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Apartment from "@/models/Apartment";
import { ApiResponse } from "@/types";

// GET single apartment
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

    const apartment = await Apartment.findById(params.id).populate("residents", "firstName lastName email phone");

    if (!apartment) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Daire bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: apartment,
    });
  } catch (error) {
    console.error("Get apartment error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT update apartment
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

    const apartment = await Apartment.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!apartment) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Daire bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: apartment,
      message: "Daire güncellendi",
    });
  } catch (error: any) {
    console.error("Update apartment error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE apartment
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

    const apartment = await Apartment.findByIdAndDelete(params.id);

    if (!apartment) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Daire bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Daire silindi",
    });
  } catch (error) {
    console.error("Delete apartment error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}






