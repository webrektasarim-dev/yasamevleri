import mongoose, { Schema, Model } from "mongoose";

export interface IFacilitySettings {
  facilityType: string;
  weeklySchedule: {
    [key: string]: { // "monday", "tuesday", etc.
      isOpen: boolean;
      closedHours?: number[]; // [0, 1, 2, 22, 23] - Kapalı saatler
    };
  };
  closedDates?: Date[]; // Özel kapalı günler
  createdAt?: Date;
  updatedAt?: Date;
}

const FacilitySettingsSchema = new Schema<IFacilitySettings>(
  {
    facilityType: {
      type: String,
      required: true,
      unique: true,
    },
    weeklySchedule: {
      type: Schema.Types.Mixed,
      default: () => ({
        monday: { isOpen: true, closedHours: [] },
        tuesday: { isOpen: true, closedHours: [] },
        wednesday: { isOpen: true, closedHours: [] },
        thursday: { isOpen: true, closedHours: [] },
        friday: { isOpen: true, closedHours: [] },
        saturday: { isOpen: true, closedHours: [] },
        sunday: { isOpen: true, closedHours: [] },
      }),
    },
    closedDates: [{ type: Date }],
  },
  {
    timestamps: true,
    strict: false,
  }
);

const FacilitySettings: Model<IFacilitySettings> =
  mongoose.models.FacilitySettings ||
  mongoose.model<IFacilitySettings>("FacilitySettings", FacilitySettingsSchema);

export default FacilitySettings;

