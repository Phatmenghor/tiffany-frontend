import { BasePagination } from "@/utils/common/pagination";

export interface AllSubCategoriesResponseModel extends BasePagination {
  content: SubCategoriesResponseModel[];
}

export interface SubCategoriesResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  imageUrl: string;
  status: string;
  categoryId: string;
  categoryName: string;
}
