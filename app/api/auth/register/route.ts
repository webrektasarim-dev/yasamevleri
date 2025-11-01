import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
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

    if (password.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    await dbConnect();

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

