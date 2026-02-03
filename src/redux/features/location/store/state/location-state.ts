import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
  selectProduct,
  selectProductContent,
  selectProductState,
} from "../selectors/location-selector";

export const useProductState = () => {
  const dispatch = useAppDispatch();

  const productState = useAppSelector(selectProductState);
  const productData = useAppSelector(selectProduct);
  const productContent = useAppSelector(selectProductContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    productState,
    productData,
    productContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
