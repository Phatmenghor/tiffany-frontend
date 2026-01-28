import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface CreateRoleRequest {
  name: string;
  description: string;
  businessId: string;
  userType: string;
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
}

export interface AllRoleRequest extends BaseGetAllRequest {
  businessId?: string;
  userTypes?: string[];
  includeAll?: boolean;
}

export interface UpdateRoleParams {
  roleId: string;
  roleData: UpdateRoleRequest;
}
