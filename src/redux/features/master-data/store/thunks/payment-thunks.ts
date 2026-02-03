import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllPaymentRequest,
  CreatePaymentData,
  UpdatePaymentParams,
} from "../models/request/paymemt-request";

/**
 * Fetch all payment
 */
export const fetchAllPaymentService = createApiThunk<any, AllPaymentRequest>(
  "payment-method/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/payment-methods/all",
      params,
    );
    return response.data.data;
  },
);

/**
 * Fetch payment by ID
 */
export const fetchPaymentByIdService = createApiThunk<any, string>(
  "payment-method/fetchById",
  async (paymentId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/payment-methods/${paymentId}`,
    );
    return response.data.data;
  },
);

/**
 * Create payment methods
 */
export const createPaymentService = createApiThunk<any, CreatePaymentData>(
  "payment-method/create",
  async (paymentMethodData) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/payment-methods",
      paymentMethodData,
    );
    return response.data.data;
  },
);

/**
 * Update payment
 */
export const updatePaymentService = createApiThunk<any, UpdatePaymentParams>(
  "payment-method/update",
  async ({ paymentId, paymentData }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/payment-methods/${paymentId}`,
      paymentData,
    );
    return response.data.data;
  },
);

/**
 * Delete payment
 */
export const deletePaymentService = createApiThunk<any, string>(
  "payment-method/delete",
  async (paymentMethodId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/payment-methods/${paymentMethodId}`,
    );
    return response.data.data;
  },
);
