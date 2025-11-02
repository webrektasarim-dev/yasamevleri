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

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    await dbConnect();

    const payments = await Payment.find({ userId })
      .populate({
        path: "duesId",
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
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}







