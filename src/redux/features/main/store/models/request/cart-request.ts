export interface AddToCartRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;
}
