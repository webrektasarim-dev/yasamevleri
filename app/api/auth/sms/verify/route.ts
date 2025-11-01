import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SMSVerification from "@/models/SMSVerification";
import User from "@/models/User";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Telefon numarası ve kod gereklidir" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find verification record
    let verification = await SMSVerification.findOne({
      phone,
      code,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    // In development, accept any code for testing
    if (!verification && process.env.NODE_ENV === 'development') {
      verification = await SMSVerification.create({
        phone,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
      });
    }

    if (!verification) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Geçersiz veya süresi dolmuş kod" },
        { status: 400 }
      );
    }

    // Mark as verified
    verification.verified = true;
    await verification.save();

    // Update user's phone verification status
    await User.updateOne({ phone }, { isPhoneVerified: true });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Telefon doğrulandı",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

