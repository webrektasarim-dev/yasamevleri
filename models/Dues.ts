import mongoose, { Schema, Model } from "mongoose";
import { IDues } from "@/types";

const DuesSchema = new Schema<IDues>(
  {
    apartmentId: {
      type: Schema.Types.ObjectId,
      ref: "Apartment",
      required: [true, "Apartment ID is required"],
    },
    period: {
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        required: true,
      },
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "unpaid",
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    breakdown: {
      management: {
        type: Number,
        default: 0,
      },
      electricity: {
        type: Number,
        default: 0,
      },
      water: {
        type: Number,
        default: 0,
      },
      naturalGas: {
        type: Number,
        default: 0,
      },
      cleaning: {
        type: Number,
        default: 0,
      },
      maintenance: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying by apartment and period
DuesSchema.index({ apartmentId: 1, "period.year": 1, "period.month": 1 });

const Dues: Model<IDues> =
  mongoose.models.Dues || mongoose.model<IDues>("Dues", DuesSchema);

export default Dues;






