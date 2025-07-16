import { z } from "zod";

// Admin Authentication Schema
export const adminSchema = z.object({
  id: z.string(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string(), // Will be hashed
  email: z.string().email().optional(),
  role: z.enum(["admin", "super_admin"]).default("admin"),
  isActive: z.boolean().default(true),
  lastLogin: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const insertAdminSchema = adminSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Admin Session Schema
export const adminSessionSchema = z.object({
  id: z.string(),
  adminId: z.string(),
  token: z.string(),
  expiresAt: z.string(),
  createdAt: z.string()
});

// Student schema
export const studentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
  room: z.string().min(1, "Room number is required"),
  joiningDate: z.string(),
  feeStatus: z.enum(["pending", "paid"]),
  paymentMode: z.enum(["upi", "cash"]).optional(),
  updatedBy: z.enum(["student", "admin"]).optional(),
  lastUpdated: z.string(),
});

export const insertStudentSchema = studentSchema.omit({ id: true });

export const hostelSettingsSchema = z.object({
  id: z.string(),
  monthlyFee: z.number().min(0, "Fee must be positive"),
  upiId: z.string().min(1, "UPI ID is required"),
  hostelName: z.string().min(1, "Hostel name is required"),
  enablePayNow: z.boolean().default(true),
  lastMonthlyReset: z.string().optional(),
});

export const insertHostelSettingsSchema = hostelSettingsSchema.omit({ id: true });

export const verificationSchema = z.object({
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
});

// Business expense schema
export const expenseSchema = z.object({
  id: z.string(),
  category: z.enum(["maintenance", "salary", "rent", "utility", "grocery", "wifi", "other"]),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.string(),
  paymentMethod: z.enum(["cash", "upi", "bank_transfer", "cheque"]),
  recipientName: z.string().min(1, "Recipient name is required"),
  notes: z.string().optional(),
  createdBy: z.string().default("admin"),
  createdAt: z.string(),
});

export const insertExpenseSchema = expenseSchema.omit({ id: true, createdAt: true });

// Notification schema for real-time alerts
export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(["payment_claimed", "payment_received", "student_action", "system_alert"]),
  title: z.string(),
  message: z.string(),
  studentId: z.string().optional(),
  studentName: z.string().optional(),
  amount: z.number().optional(),
  paymentMethod: z.string().optional(),
  timestamp: z.string(),
  isRead: z.boolean().default(false),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

// Payment tracking schema for UPI integration
export const paymentTrackingSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  transactionId: z.string().optional(),
  upiRef: z.string().optional(),
  amount: z.number(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  paymentMethod: z.enum(["upi", "cash", "bank_transfer"]),
  initiatedAt: z.string(),
  completedAt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const insertNotificationSchema = notificationSchema.omit({ id: true });
export const insertPaymentTrackingSchema = paymentTrackingSchema.omit({ id: true });

export type Student = z.infer<typeof studentSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type HostelSettings = z.infer<typeof hostelSettingsSchema>;
export type InsertHostelSettings = z.infer<typeof insertHostelSettingsSchema>;
export type Verification = z.infer<typeof verificationSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type PaymentTracking = z.infer<typeof paymentTrackingSchema>;
export type InsertPaymentTracking = z.infer<typeof insertPaymentTrackingSchema>;
export type Admin = z.infer<typeof adminSchema>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type AdminSession = z.infer<typeof adminSessionSchema>;
