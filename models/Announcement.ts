import mongoose, { Schema, Model } from "mongoose";
import { IAnnouncement } from "@/types";

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
    },
    createdBy: {
      type: String,
      required: [true, "Created by is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying announcements
AnnouncementSchema.index({ publishDate: -1 });
AnnouncementSchema.index({ priority: 1, publishDate: -1 });

const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;







