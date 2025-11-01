import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import SMSVerification from "@/models/SMSVerification";
import { generateVerificationCode, sendVerificationCode } from "@/lib/sms";
import { ApiResponse } from "@/types";

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

    // Kullanıcının var olup olmadığını kontrol et
    const user = await User.findOne({ phone });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Bu telefon numarasına kayıtlı kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Doğrulama kodu oluştur
    const code = generateVerificationCode();

    // SMS doğrulama kaydı oluştur
    await SMSVerification.create({
      phone,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 dakika
    });

    // SMS gönder
    try {
      await sendVerificationCode(phone, code);
    } catch (smsError) {
      // SMS gönderilemese bile development modda devam et
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Doğrulama kodu gönderildi",
      data: process.env.NODE_ENV === 'development' ? { code } : undefined,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

