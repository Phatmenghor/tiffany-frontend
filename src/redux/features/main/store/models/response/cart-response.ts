export interface CartResponseModel {
  items: CartItemModel[];
  totalItems: number;
  totalOriginalPrice: number;
  totalDiscount: number;
  totalPayment: number;
}

export interface CartItemModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  productId: string;
  productName: string;
  productMainImageUrl: string;
  productSizeId: string | null;
  productSizeName: string | null;
  quantity: number;
  originalPrice: number;
  displayPrice: number;
  unitPrice: number;
  totalOriginalPrice: number;
  totalPrice: number;
  discountAmount: number;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
  hasActivePromotion: boolean;
  note: string | null;
}

// Backward compatible alias
export type CartItemResponseModel = CartItemModel;
