import mongoose, { Schema, Model } from "mongoose";
import { IApartment } from "@/types";

const ApartmentSchema = new Schema<IApartment>(
  {
    blockNumber: {
      type: Number,
      required: [true, "Block number is required"],
      min: 1,
      max: 46,
    },
    apartmentNumber: {
      type: String,
      required: [true, "Apartment number is required"],
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, "Floor is required"],
    },
    squareMeters: {
      type: Number,
      required: [true, "Square meters is required"],
      min: 0,
    },
    parkingSpot: {
      spotNumber: String,
      licensePlate: String,
    },
    residents: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    duesCoefficient: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index for block + apartment number
ApartmentSchema.index({ blockNumber: 1, apartmentNumber: 1 }, { unique: true });

const Apartment: Model<IApartment> =
  mongoose.models.Apartment ||
  mongoose.model<IApartment>("Apartment", ApartmentSchema);

export default Apartment;







