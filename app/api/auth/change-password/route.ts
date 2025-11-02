import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Settings from "@/models/Settings";
import { ApiResponse } from "@/types";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Oturum bulunamadı" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tüm alanlar gereklidir" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get security settings
    const securitySettings = await Settings.findOne({ type: 'security' });
    const passwordPolicy = securitySettings?.settings?.passwordPolicy || {
      minLength: 6,
      requireUppercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    };

    // Validate password against policy
    if (newPassword.length < passwordPolicy.minLength) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Yeni şifre en az ${passwordPolicy.minLength} karakter olmalıdır` },
        { status: 400 }
      );
    }

    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(newPassword)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Şifre en az bir büyük harf içermelidir" },
        { status: 400 }
      );
    }

    if (passwordPolicy.requireNumbers && !/[0-9]/.test(newPassword)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Şifre en az bir rakam içermelidir" },
        { status: 400 }
      );
    }

    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Şifre en az bir özel karakter içermelidir" },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Mevcut şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Mevcut şifre yanlış" },
        { status: 400 }
      );
    }

    // Yeni şifreyi hashle ve güncelle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Şifre başarıyla değiştirildi",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

