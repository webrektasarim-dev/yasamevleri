import mongoose, { Schema, Model } from "mongoose";
import { IReservation } from "@/types";

const ReservationSchema = new Schema<IReservation>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    facilityType: {
      type: String,
      required: [true, "Facility type is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    status: {
      type: String,
      enum: ["approved", "pending", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying reservations
ReservationSchema.index({ userId: 1, startTime: -1 });
ReservationSchema.index({ facilityType: 1, startTime: 1 });

const Reservation: Model<IReservation> =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", ReservationSchema);

export default Reservation;






