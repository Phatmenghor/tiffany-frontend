import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { toggleFavoriteRequest } from "../models/request/favorite-request";
import { AllProductRequest } from "@/redux/features/business/store/models/request/product-request";

export const fetchFavoriteList = createApiThunk<any, AllProductRequest>(
  "product-favorites/fetchFavoriteList",
  async (request) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/product-favorites/my-favorites",
      request,
    );
    return response.data.data;
  },
);

export const toggleFavoriteList = createApiThunk<void, toggleFavoriteRequest>(
  "product-favorites/toggleFavorite",
  async (data) => {
    await axiosClientWithAuth.post(
      `/api/v1/product-favorites/${data.productId}/toggle`,
      data,
    );
  },
);

export const removeAllFromFavorite = createApiThunk<void, void>(
  "product-favorites/removeAllFromFavorite",
  async () => {
    await axiosClientWithAuth.delete(`/api/v1/product-favorites/all`);
  },
);
