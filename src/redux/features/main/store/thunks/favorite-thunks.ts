import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { WishlistResponseModel } from "../models/response/wishlist-response";
import {
  RemoveFromFavoriteRequest,
  toggleFavoriteRequest,
} from "../models/request/wishlist-request";

export const fetchFavoriteList = createApiThunk<WishlistResponseModel, void>(
  "product-favorites/fetchFavoriteList",
  async () => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/product-favorites/my-favorites",
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

export const removeFromFavorite = createApiThunk<
  void,
  RemoveFromFavoriteRequest
>("product-favorites/removeFromFavorite", async (data) => {
  await axiosClientWithAuth.delete(
    `/api/v1/product-favorites/${data.favoriteId}`,
  );
});

export const removeAllFromFavorite = createApiThunk<void, void>(
  "product-favorites/removeAllFromFavorite",
  async () => {
    await axiosClientWithAuth.delete(`/api/v1/product-favorites/all`);
  },
);
