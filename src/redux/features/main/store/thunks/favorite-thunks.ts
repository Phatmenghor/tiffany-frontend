import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { ToggleFavoriteRequest } from "../models/request/favorite-request";
import { AllFavoriteResponseModel } from "../models/response/favorite-response";

// Service 1: Fetch all favorites list
export const fetchFavoriteList = createApiThunk<AllFavoriteResponseModel, void>(
  "product-favorites/fetchFavoriteList",
  async () => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/product-favorites/my-favorites",
      { pageNo: 1, pageSize: 20 },
    );
    return response.data.data;
  },
);

// Service 2: Toggle favorite (auto add if not exist, remove if exist - dynamic)
export const toggleFavorite = createApiThunk<void, ToggleFavoriteRequest>(
  "product-favorites/toggleFavorite",
  async (data) => {
    await axiosClientWithAuth.post(
      `/api/v1/product-favorites/${data.productId}/toggle`,
    );
  },
);

// Service 3: Clear all favorites
export const clearAllFavorites = createApiThunk<void, void>(
  "product-favorites/clearAllFavorites",
  async () => {
    await axiosClientWithAuth.delete("/api/v1/product-favorites/all");
  },
);
