import mongoose, { Schema, Model } from "mongoose";
import { IPayment } from "@/types";

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    duesId: {
      type: String,
      required: [true, "Dues ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "bank_transfer", "cash"],
      required: [true, "Payment method is required"],
    },
    iyzicoTransactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying payments
PaymentSchema.index({ userId: 1, paymentDate: -1 });
PaymentSchema.index({ duesId: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;







