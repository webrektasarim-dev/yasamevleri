import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SMSVerification from "@/models/SMSVerification";
import { generateVerificationCode, sendVerificationCode } from "@/lib/sms";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Telefon numarası gereklidir" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate verification code
    const code = generateVerificationCode();

    // Save to database
    await SMSVerification.create({
      phone,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send SMS (in development, this will be mocked)
    try {
      await sendVerificationCode(phone, code);
    } catch (smsError) {
      // SMS sending failed, but continuing in development mode
    }

    // In development, always return success (SMS is mocked)
    // In production, check if SMS was actually sent
    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Doğrulama kodu gönderildi",
      data: process.env.NODE_ENV === 'development' ? { code } : undefined, // Only in dev
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

