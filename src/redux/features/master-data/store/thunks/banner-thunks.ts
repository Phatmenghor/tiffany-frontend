import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllBannerRequest,
  CreateBannerRequest,
  UpdateBannerParams,
} from "../models/request/banner-request";

/**
 * Fetch all banner
 */
export const fetchAllBannerService = createApiThunk<any, AllBannerRequest>(
  "banners/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/banner/all",
      params,
    );
    return response.data.data;
  },
);

/**
 * Fetch banner by ID
 */
export const fetchBannerByIdService = createApiThunk<any, string>(
  "banners/fetchById",
  async (bannerId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/banner/${bannerId}`,
    );
    return response.data.data;
  },
);

/**
 * Create banner
 */
export const createBannerService = createApiThunk<any, CreateBannerRequest>(
  "banners/create",
  async (bannerData) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/banner",
      bannerData,
    );
    return response.data.data;
  },
);

/**
 * Update banner
 */
export const updateBannerService = createApiThunk<any, UpdateBannerParams>(
  "banners/update",
  async ({ id, payload }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/banner/${id}`,
      payload,
    );
    return response.data.data;
  },
);

/**
 * Delete banner
 */
export const deleteBannerService = createApiThunk<any, string>(
  "banners/delete",
  async (bannerId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/banner/${bannerId}`,
    );
    return response.data.data;
  },
);
