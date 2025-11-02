import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

// GET all users
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

    const users = await User.find()
      .select("-password")
      .populate("apartmentId", "blockNumber apartmentNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: users,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}







