import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllProductRequest,
  UpdateProductParams,
} from "../models/request/product-request";
import { CreateProductData } from "../models/schema/product-schema";

/**
 * Fetch all Product admin
 */
export const fetchAllProductAdminService = createApiThunk<
  any,
  AllProductRequest
>("products/fetchAllByAdmin", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/products/admin/all",
    params,
  );
  return response.data.data;
});

/**
 * Fetch all Product
 */
export const fetchAllProductService = createApiThunk<any, AllProductRequest>(
  "products/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/products/all",
      params,
    );
    return response.data.data;
  },
);

/**
 * Fetch Product by ID
 */
export const fetchProductByIdService = createApiThunk<any, string>(
  "products/fetchById",
  async (productId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/products/${productId}`,
    );
    return response.data.data;
  },
);

/**
 * Create Product
 */
export const createProductService = createApiThunk<any, CreateProductData>(
  "products/create",
  async (productData) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/products",
      productData,
    );
    return response.data.data;
  },
);

/**
 * Update Product
 */
export const updateProductService = createApiThunk<any, UpdateProductParams>(
  "products/update",
  async ({ productId, productData }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/products/${productId}`,
      productData,
    );
    return response.data.data;
  },
);

/**
 * Delete Product
 */
export const deleteProductService = createApiThunk<any, string>(
  "products/delete",
  async (bannerId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/products/${bannerId}`,
    );
    return response.data.data;
  },
);
