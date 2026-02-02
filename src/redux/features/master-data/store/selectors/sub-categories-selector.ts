import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectSubCategoriesState = (state: RootState) =>
  state.subCategories;

export const selectsubCategories = (state: RootState) =>
  state.subCategories.data;

export const selectSelectedSubCategories = (state: RootState) =>
  state.subCategories.selectedSubCategories;

export const selectSubCategoriesContent = createSelector(
  [selectsubCategories],
  (data) => data?.content || [],
);

export const selectIsLoading = (state: RootState) =>
  state.subCategories.isLoading;
export const selectIsFetchingDetail = (state: RootState) =>
  state.subCategories.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.subCategories.error;

export const selectFilters = (state: RootState) => state.subCategories.filters;
export const selectOperations = (state: RootState) =>
  state.subCategories.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector(
  [selectsubCategories],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 15,
    last: data?.last || false,
    first: data?.first || true,
    hasNext: data?.hasNext || false,
    hasPrevious: data?.hasPrevious || false,
  }),
);
