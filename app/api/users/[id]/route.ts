import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Apartment from "@/models/Apartment";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

// GET single user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(params.id)
      .select("-password")
      .populate("apartmentId", "blockNumber apartmentNumber floor squareMeters");

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    await dbConnect();

    // Get current user
    const currentUser = await User.findById(params.id);
    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // If apartment is changing, update both old and new apartments
    if (body.apartmentId !== undefined && body.apartmentId !== currentUser.apartmentId?.toString()) {
      // Remove from old apartment
      if (currentUser.apartmentId) {
        await Apartment.findByIdAndUpdate(currentUser.apartmentId, {
          $pull: { residents: params.id },
        });
      }

      // Add to new apartment
      if (body.apartmentId) {
        await Apartment.findByIdAndUpdate(body.apartmentId, {
          $addToSet: { residents: params.id },
        });
      }
    }

    // Update user with all fields from body
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: false, strict: false }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Güncelleme başarısız" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedUser,
      message: "Kullanıcı güncellendi",
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Remove from apartment
    if (user.apartmentId) {
      await Apartment.findByIdAndUpdate(user.apartmentId, {
        $pull: { residents: params.id },
      });
    }

    await User.findByIdAndDelete(params.id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Kullanıcı silindi",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}







