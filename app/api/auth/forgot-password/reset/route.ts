import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import SMSVerification from "@/models/SMSVerification";
import { ApiResponse } from "@/types";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { phone, code, newPassword } = await req.json();

    if (!phone || !code || !newPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tüm alanlar gereklidir" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Doğrulanmış kodu kontrol et
    const verification = await SMSVerification.findOne({
      phone,
      code,
      verified: true,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!verification) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Geçersiz veya süresi dolmuş işlem" },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ phone });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Şifreyi hashle ve güncelle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Kullanılan doğrulama kodunu sil
    await SMSVerification.deleteMany({ phone, code });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Şifre başarıyla güncellendi",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

