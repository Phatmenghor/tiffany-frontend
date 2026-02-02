import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllProductRequest extends BaseGetAllRequest {
  subCategoryId?: string;
  categoryId?: string;
  status?: string;
  hasPromotion?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductImageRequest {
  id?: string; // If exists, update; if not, create
  imageUrl: string;
}

export interface ProductSizeRequest {
  id?: string; // If exists, update; if not, create
  name: string;
  price: number;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  subCategoryId: string;
  price: number;
  mainImageUrl: string;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
  // Images and sizes
  images?: ProductImageRequest[];
  sizes?: ProductSizeRequest[];
  status: string;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  subCategoryId: string;
  price: number;
  mainImageUrl: string;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;

  images?: ProductImageRequest[];
  sizes?: ProductSizeRequest[];

  status: string;
}

export interface UpdateProductParams {
  productId: string;
  productData: UpdateProductRequest;
}
