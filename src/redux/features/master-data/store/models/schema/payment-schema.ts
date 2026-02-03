import { z } from "zod";

/**
 * Create Payment Schema
 */
export const createPaymentSchema = z.object({
  type: z.string().min(1, "type is required"),
  name: z.string().min(1, "name is required"),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  qrCodeImageUrl: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().optional(),
});

/**
 * Update Payment Schema
 */
export const updatePaymentSchema = z.object({
  type: z.string().min(1, "type is required"),
  name: z.string().min(1, "name is required"),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  qrCodeImageUrl: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().optional(),
});

export type PaymentFormData = {
  id?: string;
  type: string;
  name: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  qrCodeImageUrl?: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
};
