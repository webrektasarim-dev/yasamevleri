import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/types";

// Eski kullanıcıları migrate et - isApproved alanı ekle
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // isApproved alanı olmayan kullanıcıları bul ve güncelle
    const result = await User.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: false } }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `${result.modifiedCount} kullanıcı güncellendi`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

