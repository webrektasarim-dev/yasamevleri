import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISettings extends Document {
  _id: string;
  type: 'notification' | 'security';
  settings: any;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    type: {
      type: String,
      enum: ['notification', 'security'],
      required: true,
      unique: true,
    },
    settings: {
      type: Schema.Types.Mixed,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;

