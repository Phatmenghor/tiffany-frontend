import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectProductState = (state: RootState) => state.products;

export const selectProduct = (state: RootState) => state.products.data;

export const selectSelectedProduct = (state: RootState) =>
  state.products.selectedProduct;

export const selectProductContent = createSelector(
  [selectProduct],
  (data) => data?.content || [],
);

export const selectIsLoading = (state: RootState) => state.products.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.products.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.products.error;

export const selectFilters = (state: RootState) => state.products.filters;

export const selectOperations = (state: RootState) => state.products.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectProduct], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
