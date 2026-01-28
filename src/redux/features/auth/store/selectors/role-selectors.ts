import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectRolesState = (state: RootState) => state.roles;

export const selectRoles = (state: RootState) => state.roles.data;

export const selectSelectedRole = (state: RootState) =>
  state.roles.selectedRole;

export const selectRoleContent = createSelector(
  [selectRoles],
  (data) => data?.content || [],
);

export const selectIsLoading = (state: RootState) => state.roles.isLoading;
export const selectIsFetchingDetail = (state: RootState) =>
  state.roles.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.roles.error;

export const selectFilters = (state: RootState) => state.roles.filters;
export const selectOperations = (state: RootState) => state.roles.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectRoles], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
