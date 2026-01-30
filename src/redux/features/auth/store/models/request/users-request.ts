/**
 * User Request Types
 */

import { BaseGetAllRequest } from "@/utils/common/get-all-request";

/**
 * Create User Request
 */
export interface CreateUserRequest {
  userIdentifier: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  accountStatus: string;
  role: string;
}

/**
 * Update User Request
 */
export interface UpdateUserRequest {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  accountStatus: string;
  role: string;
}

export interface AllUserRequest extends BaseGetAllRequest {
  accountStatus?: string[];
  roles?: string[];
}

export interface UpdateUserParams {
  userId: string;
  userData: UpdateUserRequest;
}

export interface ToggleUserStatusRequest {
  id: string;
  accountStatus: string;
}

export interface AdminChangePasswordRequest {
  userId: string;
  newPassword: string;
  confirmPassword: string;
}
