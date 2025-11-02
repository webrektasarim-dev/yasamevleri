import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

// GET announcements
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const announcements = await Announcement.find()
      .populate("createdBy", "firstName lastName")
      .sort({ publishDate: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST create announcement
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
    const { title, content, priority } = body;

    if (!title || !content) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Başlık ve içerik gereklidir" },
        { status: 400 }
      );
    }

    await dbConnect();

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || "normal",
      createdBy: (session.user as any).id,
      publishDate: new Date(),
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: announcement,
      message: "Duyuru oluşturuldu",
    });
  } catch (error: any) {
    console.error("Create announcement error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}







