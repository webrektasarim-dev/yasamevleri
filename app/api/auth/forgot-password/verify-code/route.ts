import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SMSVerification from "@/models/SMSVerification";
import { ApiResponse } from "@/types";

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

    // Doğrulama kaydını bul
    const verification = await SMSVerification.findOne({
      phone,
      code,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!verification) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Geçersiz veya süresi dolmuş kod" },
        { status: 400 }
      );
    }

    // Kodu doğrulanmış olarak işaretle (ama henüz sil değil, şifre sıfırlama için gerekli)
    verification.verified = true;
    await verification.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Kod doğrulandı",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

