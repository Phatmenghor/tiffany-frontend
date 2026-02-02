import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllSubCategoriesRequest extends BaseGetAllRequest {
  status?: string;
  categoryId?: string;
}

export interface UpdateSubCategoriesParams {
  subCategoriesId: string;
  subCategoriesData: UpdateSubCategoriesData;
}

export type CreateSubCategoriesData = {
  name: string;
  imageUrl: string;
  categoriesId: string;
  status: string;
};

export type UpdateSubCategoriesData = {
  name: string;
  imageUrl: string;
  categoriesId: string;
  status: string;
};
