export interface AddToCartRequest {
  productId: string;
  quantity: number;
  productSizeId?: string;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
  productSizeId?: string;
}
