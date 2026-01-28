import {
  AllRoleResponseModel,
  RoleResponseModel,
} from "../response/role-response";

export interface RoleFilters {
  search: string;
  pageNo: number;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface RoleManagementState {
  data: AllRoleResponseModel | null;
  selectedRole: RoleResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: RoleFilters;
  operations: OperationStates;
}
