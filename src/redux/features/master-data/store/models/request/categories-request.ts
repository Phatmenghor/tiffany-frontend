import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllCategoriesRequest extends BaseGetAllRequest {
  status?: string;
}

export interface UpdateCategoriesParams {
  categoriesId: string;
  categoriesData: UpdateCategoriesData;
}

export type CreateCategoriesData = {
  name: string;
  imageUrl: string;
  status: string;
};

export type UpdateCategoriesData = {
  name: string;
  imageUrl: string;
  status: string;
};
