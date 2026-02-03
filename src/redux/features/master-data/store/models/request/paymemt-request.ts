import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllPaymentRequest extends BaseGetAllRequest {
  isActive?: boolean;
}

export interface UpdatePaymentParams {
  paymentId: string;
  paymentData: UpdatePaymentData;
}

export type CreatePaymentData = {
  type: string;
  name: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeImageUrl: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
};

export type UpdatePaymentData = {
  type: string;
  name: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeImageUrl: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
};
