import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AddToCartRequest,
  UpdateCartItemRequest,
} from "../models/request/cart-request";
import { CartResponseModel } from "../models/response/cart-response";

// GET /api/v1/cart - fetch all cart items
export const fetchCart = createApiThunk<CartResponseModel, void>(
  "cart/fetchCart",
  async () => {
    const response = await axiosClientWithAuth.get("/api/v1/cart");
    return response.data.data;
  }
);

// POST /api/v1/cart - add/update item (quantity 0 = remove)
export const addToCart = createApiThunk<CartResponseModel, AddToCartRequest>(
  "cart/addToCart",
  async (data) => {
    const response = await axiosClientWithAuth.post("/api/v1/cart", data);
    return response.data.data;
  }
);

// POST /api/v1/cart - update quantity (quantity 0 = remove)
export const updateCartItem = createApiThunk<
  CartResponseModel,
  UpdateCartItemRequest
>("cart/updateCartItem", async (data) => {
  const response = await axiosClientWithAuth.post("/api/v1/cart", data);
  return response.data.data;
});

// DELETE /api/v1/cart/clear - clear entire cart
export const clearCart = createApiThunk<void, void>(
  "cart/clearCart",
  async () => {
    await axiosClientWithAuth.delete("/api/v1/cart/clear");
  }
);
