import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Payment, Dues, User } from "@/models";
import { iyzicoClient } from "@/lib/iyzico";
import { ApiResponse } from "@/types";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { duesId, amount, cardData } = body;

    if (!duesId || !amount || !cardData) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Eksik bilgi" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get dues info
    const dues = await Dues.findById(duesId);
    if (!dues) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Aidat bulunamadı" },
        { status: 404 }
      );
    }

    // Get user info
    const userId = (session.user as any).id;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Initialize payment with iyzico
    const iyzicoResponse = await iyzicoClient.createPaymentRequest(
      amount,
      userId,
      duesId,
      cardData,
      {
        name: user.firstName,
        surname: user.lastName,
        email: user.email,
        phone: user.phone,
      }
    );

    // Create payment record
    const payment = await Payment.create({
      userId,
      duesId,
      amount,
      paymentMethod: "credit_card",
      iyzicoTransactionId: iyzicoResponse.paymentId || iyzicoResponse.conversationId,
      status: iyzicoResponse.status === "success" ? "success" : "failed",
      paymentDate: new Date(),
    });

    // If payment successful, update dues
    if (iyzicoResponse.status === "success") {
      const newPaidAmount = dues.paidAmount + amount;
      const newStatus =
        newPaidAmount >= dues.amount
          ? "paid"
          : newPaidAmount > 0
          ? "partial"
          : "unpaid";

      await Dues.findByIdAndUpdate(duesId, {
        paidAmount: newPaidAmount,
        status: newStatus,
        paymentDate: newStatus === "paid" ? new Date() : dues.paymentDate,
      });
    }

    return NextResponse.json<ApiResponse>({
      success: iyzicoResponse.status === "success",
      data: {
        payment,
        iyzicoResponse,
      },
      message:
        iyzicoResponse.status === "success"
          ? "Ödeme başarılı"
          : "Ödeme başarısız",
    });
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}







