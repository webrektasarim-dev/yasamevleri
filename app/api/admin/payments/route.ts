import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const payments = await Payment.find()
      .populate("userId", "firstName lastName email")
      .populate({
        path: "duesId",
        select: "period amount apartmentId",
        populate: {
          path: "apartmentId",
          select: "blockNumber apartmentNumber",
        },
      })
      .sort({ paymentDate: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}






