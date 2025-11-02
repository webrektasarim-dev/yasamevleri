import mongoose, { Schema, Model } from "mongoose";
import { ISMSVerification } from "@/types";

const SMSVerificationSchema = new Schema<ISMSVerification>(
  {
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Code is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expires at is required"],
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying and auto-deletion
SMSVerificationSchema.index({ phone: 1, createdAt: -1 });
SMSVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const SMSVerification: Model<ISMSVerification> =
  mongoose.models.SMSVerification ||
  mongoose.model<ISMSVerification>("SMSVerification", SMSVerificationSchema);

export default SMSVerification;







