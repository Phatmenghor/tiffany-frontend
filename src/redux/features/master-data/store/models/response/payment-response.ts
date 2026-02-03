import { BasePagination } from "@/utils/common/pagination";

export interface AllPaymentResponseModel extends BasePagination {
  content: PaymentResponseModel[];
}

export interface PaymentResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: any;
  updatedBy: any;
  type: string;
  name: string;
  bankName: any;
  accountName: any;
  accountNumber: any;
  qrCodeImageUrl: any;
  description: string;
  isActive: boolean;
  sortOrder: number;
}
