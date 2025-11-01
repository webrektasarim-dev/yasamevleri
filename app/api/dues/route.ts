import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Dues from "@/models/Dues";
import Apartment from "@/models/Apartment";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

// GET dues
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
    const apartmentId = searchParams.get("apartmentId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    await dbConnect();

    const query: any = {};

    if (apartmentId) {
      query.apartmentId = apartmentId;
    }

    if (month && year) {
      query["period.month"] = parseInt(month);
      query["period.year"] = parseInt(year);
    }

    if (status) {
      query.status = status;
    }

    const dues = await Dues.find(query)
      .populate("apartmentId", "blockNumber apartmentNumber floor")
      .sort({ "period.year": -1, "period.month": -1 });

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

// POST create dues
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
    const { createForAll, ...duesData } = body;

    await dbConnect();

    if (createForAll) {
      // Create dues for all apartments
      const apartments = await Apartment.find();
      const duesList = [];

      for (const apartment of apartments) {
        const amount =
          (duesData.breakdown.management +
            duesData.breakdown.electricity +
            duesData.breakdown.water +
            duesData.breakdown.naturalGas +
            duesData.breakdown.cleaning +
            duesData.breakdown.maintenance +
            duesData.breakdown.other) *
          apartment.duesCoefficient;

        const dues = await Dues.create({
          ...duesData,
          apartmentId: apartment._id,
          amount,
        });

        duesList.push(dues);
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data: duesList,
        message: `${duesList.length} daire için aidat oluşturuldu`,
      });
    } else {
      // Create dues for single apartment
      const dues = await Dues.create(duesData);

      return NextResponse.json<ApiResponse>({
        success: true,
        data: dues,
        message: "Aidat oluşturuldu",
      });
    }
  } catch (error: any) {
    console.error("Create dues error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}






