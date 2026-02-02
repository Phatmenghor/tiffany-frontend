import {
  AllSubCategoriesResponseModel,
  SubCategoriesResponseModel,
} from "../response/sub-categories-response";

export interface SubCategoriesFilters {
  search: string;
  pageNo: number;
  status: string;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface SubCategoriesManagementState {
  data: AllSubCategoriesResponseModel | null;
  selectedSubCategories: SubCategoriesResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: SubCategoriesFilters;
  operations: OperationStates;
}
