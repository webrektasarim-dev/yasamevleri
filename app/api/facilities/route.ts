import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import FacilitySettings from "@/models/FacilitySettings";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

// GET facility settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const facilities = await FacilitySettings.find().sort({ facilityType: 1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: facilities,
    });
  } catch (error) {
    console.error("Get facilities error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST create/update facility settings
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
    const { facilityType, workingHours } = body;

    await dbConnect();

    // Update or create
    const facility = await FacilitySettings.findOneAndUpdate(
      { facilityType },
      { facilityType, workingHours },
      { upsert: true, new: true }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: facility,
      message: "Tesis ayarları güncellendi",
    });
  } catch (error: any) {
    console.error("Update facility error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}





