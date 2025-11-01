import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Apartment, User, Dues, Payment, Reservation } from "@/models";
import { ApiResponse, DashboardStats } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get stats
    const totalApartments = await Apartment.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });

    // Current month dues
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentMonthDues = await Dues.find({
      "period.month": currentMonth,
      "period.year": currentYear,
    });

    const totalDues = currentMonthDues.reduce((sum, d) => sum + d.amount, 0);
    const collectedDues = currentMonthDues.reduce((sum, d) => sum + d.paidAmount, 0);
    const pendingDues = totalDues - collectedDues;
    const collectionRate = totalDues > 0 ? (collectedDues / totalDues) * 100 : 0;

    // Get monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "success",
          paymentDate: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const monthlyRevenueAmount = monthlyRevenue[0]?.total || 0;

    // Pending reservations
    const pendingReservations = await Reservation.countDocuments({
      status: "pending",
    });

    const stats: DashboardStats = {
      totalApartments,
      totalUsers,
      totalDues,
      collectedDues,
      pendingDues,
      collectionRate,
      monthlyRevenue: monthlyRevenueAmount,
      pendingReservations,
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}






