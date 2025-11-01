import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Apartment from "@/models/Apartment";
import { ApiResponse } from "@/types";

// GET all apartments
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

    const apartments = await Apartment.find().populate("residents", "firstName lastName email").sort({ blockNumber: 1, apartmentNumber: 1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: apartments,
    });
  } catch (error) {
    console.error("Get apartments error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST create apartment
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
    const { blockNumber, apartmentNumber, floor, squareMeters, parkingSpot, duesCoefficient } = body;

    await dbConnect();

    const apartment = await Apartment.create({
      blockNumber,
      apartmentNumber,
      floor,
      squareMeters,
      parkingSpot,
      duesCoefficient: duesCoefficient || 1,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: apartment,
      message: "Daire oluşturuldu",
    });
  } catch (error: any) {
    console.error("Create apartment error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}






