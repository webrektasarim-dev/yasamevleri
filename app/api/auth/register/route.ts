import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Settings from "@/models/Settings";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password, phone, firstName, lastName } = await req.json();

    // Validation
    if (!email || !password || !phone || !firstName || !lastName) {
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
    if (password.length < passwordPolicy.minLength) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Şifre en az ${passwordPolicy.minLength} karakter olmalıdır` },
        { status: 400 }
      );
    }

    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Şifre en az bir büyük harf içermelidir" },
        { status: 400 }
      );
    }

    if (passwordPolicy.requireNumbers && !/[0-9]/.test(password)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Şifre en az bir rakam içermelidir" },
        { status: 400 }
      );
    }

    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Şifre en az bir özel karakter içermelidir" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Bu email veya telefon numarası zaten kayıtlı" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      phone,
      firstName,
      lastName,
      role: "user",
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Kayıt başarılı. Yönetici onayı bekleniyor.",
      data: {
        userId: user._id,
      },
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { 
        success: false, 
        error: `Kayıt hatası: ${error.message || "Bir hata oluştu"}` 
      },
      { status: 500 }
    );
  }
}

