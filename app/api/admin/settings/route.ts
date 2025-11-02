import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

// GET settings by type
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type || !['notification', 'security'].includes(type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid type" },
        { status: 400 }
      );
    }

    await dbConnect();

    let settingsDoc = await Settings.findOne({ type });

    // If no settings exist, create defaults
    if (!settingsDoc) {
      const defaultSettings = type === 'notification' ? {
        emailNotifications: {
          enabled: true,
          newDues: true,
          paymentConfirmation: true,
          reservationStatus: true,
          announcements: true,
          systemUpdates: false,
        },
        smsNotifications: {
          enabled: false,
          paymentReminder: false,
          reservationConfirmation: false,
          urgentAnnouncements: false,
        },
        pushNotifications: {
          enabled: false,
          realTimeUpdates: false,
          duesReminder: false,
        },
      } : {
        passwordPolicy: {
          minLength: 6,
          requireUppercase: false,
          requireNumbers: false,
          requireSpecialChars: false,
          expirationDays: 0,
        },
        sessionSettings: {
          sessionTimeout: 24,
          maxConcurrentSessions: 3,
          autoLogoutInactive: true,
          inactivityTimeout: 30,
        },
        twoFactorAuth: {
          enabled: false,
          requireForAdmin: false,
          method: 'sms',
        },
        loginSecurity: {
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          requireEmailVerification: true,
          requirePhoneVerification: false,
        },
      };

      settingsDoc = await Settings.create({
        type,
        settings: defaultSettings,
        updatedBy: (session.user as any)?.email,
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: settingsDoc.settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Ayarlar yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST/PUT settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, settings } = body;

    if (!type || !['notification', 'security'].includes(type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid type" },
        { status: 400 }
      );
    }

    await dbConnect();

    const settingsDoc = await Settings.findOneAndUpdate(
      { type },
      { 
        settings,
        updatedBy: (session.user as any)?.email,
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: settingsDoc.settings,
      message: "Ayarlar kaydedildi",
    });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Ayarlar kaydedilemedi" },
      { status: 500 }
    );
  }
}

