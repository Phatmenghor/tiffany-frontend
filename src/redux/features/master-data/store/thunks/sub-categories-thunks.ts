import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllSubCategoriesRequest,
  CreateSubCategoriesData,
  UpdateSubCategoriesParams,
} from "../models/request/sub-categories-request";

/**
 * Fetch all sub categories
 */
export const fetchAllSubCategoriesService = createApiThunk<
  any,
  AllSubCategoriesRequest
>("sub-categories/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/sub-categories/all",
    params,
  );
  return response.data.data;
});

/**
 * Fetch sub categories by ID
 */
export const fetchSubCategoriesByIdService = createApiThunk<any, string>(
  "sub-categories/fetchById",
  async (subCategoriesId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/sub-categories/${subCategoriesId}`,
    );
    return response.data.data;
  },
);

/**
 * Create sub categories
 */
export const createSubCategoriesService = createApiThunk<
  any,
  CreateSubCategoriesData
>("sub-categories/create", async (subCategoriesData) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/sub-categories",
    subCategoriesData,
  );
  return response.data.data;
});

/**
 * Update sub categories
 */
export const updateSubCategoriesService = createApiThunk<
  any,
  UpdateSubCategoriesParams
>("sub-categories/update", async ({ subCategoriesId, subCategoriesData }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/sub-categories/${subCategoriesId}`,
    subCategoriesData,
  );
  return response.data.data;
});

/**
 * Delete sub categories
 */
export const deleteSubCategoriesService = createApiThunk<any, string>(
  "sub-categories/delete",
  async (subCategoriesId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/sub-categories/${subCategoriesId}`,
    );
    return response.data.data;
  },
);
