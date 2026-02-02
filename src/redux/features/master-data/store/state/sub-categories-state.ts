import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
  selectsubCategories,
  selectSubCategoriesContent,
  selectSubCategoriesState,
} from "../selectors/sub-categories-selector";

export const useSubCategoriesState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const subCategoriesState = useAppSelector(selectSubCategoriesState);
  const subCategoriesData = useAppSelector(selectsubCategories);
  const subCategoriesContent = useAppSelector(selectSubCategoriesContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    subCategoriesState,
    subCategoriesData,
    subCategoriesContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
