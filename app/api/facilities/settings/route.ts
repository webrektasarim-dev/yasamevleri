import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import FacilitySettings from "@/models/FacilitySettings";

export const dynamic = 'force-dynamic';

// GET - Tüm tesis ayarlarını getir
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const facilityType = searchParams.get("facilityType");

    if (facilityType) {
      let settings = await FacilitySettings.findOne({ facilityType });
      
      // Eğer ayar yoksa default oluştur
      if (!settings) {
        settings = await FacilitySettings.create({
          facilityType,
          weeklySchedule: {
            monday: { isOpen: true, closedHours: [] },
            tuesday: { isOpen: true, closedHours: [] },
            wednesday: { isOpen: true, closedHours: [] },
            thursday: { isOpen: true, closedHours: [] },
            friday: { isOpen: true, closedHours: [] },
            saturday: { isOpen: true, closedHours: [] },
            sunday: { isOpen: true, closedHours: [] },
          },
          closedDates: [],
        });
      }

      return NextResponse.json({ success: true, data: settings });
    }

    const allSettings = await FacilitySettings.find();
    return NextResponse.json({ success: true, data: allSettings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Tesis ayarlarını güncelle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { facilityType, weeklySchedule, closedDates } = body;

    if (!facilityType) {
      return NextResponse.json(
        { success: false, error: "Tesis türü gerekli" },
        { status: 400 }
      );
    }

    let settings = await FacilitySettings.findOne({ facilityType });

    if (settings) {
      // Mevcut ayarları güncelle
      settings.weeklySchedule = weeklySchedule;
      settings.closedDates = closedDates;
      settings.markModified('weeklySchedule'); // Mixed type için gerekli
      await settings.save();
    } else {
      // Yeni ayar oluştur
      settings = await FacilitySettings.create({
        facilityType,
        weeklySchedule,
        closedDates,
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

