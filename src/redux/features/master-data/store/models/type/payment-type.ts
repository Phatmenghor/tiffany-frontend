import {
  AllPaymentResponseModel,
  PaymentResponseModel,
} from "../response/payment-response";

export interface PaymentFilters {
  search: string;
  pageNo: number;
  isActive: boolean | null;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface PaymentManagementState {
  data: AllPaymentResponseModel | null;
  selectedPayment: PaymentResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: PaymentFilters;
  operations: OperationStates;
}
