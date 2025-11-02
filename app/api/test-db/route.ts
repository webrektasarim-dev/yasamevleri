import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    return NextResponse.json({
      success: true,
      message: "MongoDB bağlantısı başarılı!",
    });
  } catch (error: any) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}





