import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllRoleRequest,
  CreateRoleRequest,
  UpdateRoleParams,
} from "../models/request/role-request";

export const fetchAllRoleService = createApiThunk<any, AllRoleRequest>(
  "roles/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/roles/all",
      params,
    );
    return response.data.data;
  },
);

export const fetchRoleByIdService = createApiThunk<any, string>(
  "roles/fetchById",
  async (userId) => {
    const response = await axiosClientWithAuth.get(`/api/v1/roles/${userId}`);
    return response.data.data;
  },
);

export const createRoleService = createApiThunk<any, CreateRoleRequest>(
  "roles/create",
  async (userData) => {
    const response = await axiosClientWithAuth.post("/api/v1/roles", userData);
    return response.data.data;
  },
);

export const updateRoleService = createApiThunk<any, UpdateRoleParams>(
  "roles/update",
  async ({ roleId, roleData }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/roles/${roleId}`,
      roleData,
    );
    return response.data.data;
  },
);

export const deleteRoleService = createApiThunk<any, string>(
  "roles/delete",
  async (roleId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/roles/${roleId}`,
    );
    return response.data.data;
  },
);
