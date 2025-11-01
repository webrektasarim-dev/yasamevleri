import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  apartmentId?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApartment extends Document {
  _id: string;
  blockNumber: number;
  apartmentNumber: string;
  floor: number;
  squareMeters: number;
  parkingSpot?: {
    spotNumber: string;
    licensePlate?: string;
  };
  residents: string[]; // User IDs
  duesCoefficient: number; // Aidat katsayısı
  createdAt: Date;
  updatedAt: Date;
}

export interface IDues extends Document {
  _id: string;
  apartmentId: string;
  period: {
    month: number;
    year: number;
  };
  amount: number;
  status: "paid" | "unpaid" | "partial";
  paidAmount: number;
  paymentDate?: Date;
  dueDate: Date;
  breakdown: {
    management: number;
    electricity: number;
    water: number;
    naturalGas: number;
    cleaning: number;
    maintenance: number;
    other: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  _id: string;
  userId: string;
  duesId: string;
  amount: number;
  paymentMethod: "credit_card" | "bank_transfer" | "cash";
  iyzicoTransactionId?: string;
  status: "success" | "failed" | "pending";
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReservation extends Document {
  _id: string;
  userId: string;
  facilityType: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: "approved" | "pending" | "cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnnouncement extends Document {
  _id: string;
  title: string;
  content: string;
  publishDate: Date;
  priority: "normal" | "urgent";
  createdBy: string; // Admin User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface ISMSVerification extends Document {
  _id: string;
  phone: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalApartments: number;
  totalUsers: number;
  totalDues: number;
  collectedDues: number;
  pendingDues: number;
  collectionRate: number;
  monthlyRevenue: number;
  pendingReservations: number;
}






