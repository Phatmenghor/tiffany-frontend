/**
 * Session Management Feature - Async Thunks
 * Redux thunks for session management operations
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { SessionFilterRequest } from "../models/request/session-request";
import {
  UserSessionResponse,
  AdminSessionResponse,
  PaginatedSessionsResponse,
} from "../models/response/session-response";

/**
 * Get all user sessions
 * For regular users to view their own sessions
 */
export const getAllSessionsService = createApiThunk<
  UserSessionResponse[],
  void
>("sessions/getAll", async () => {
  const response = await axiosClientWithAuth.get("/api/v1/sessions/all");
  return response.data.data;
});

/**
 * Get session by ID
 * View details of a specific session
 */
export const getSessionByIdService = createApiThunk<
  UserSessionResponse,
  string
>("sessions/getById", async (sessionId) => {
  const response = await axiosClientWithAuth.get(
    `/api/v1/sessions/${sessionId}`
  );
  return response.data.data;
});

/**
 * Logout specific session
 * Terminate a single session by ID
 */
export const logoutSessionService = createApiThunk<void, string>(
  "sessions/logoutSession",
  async (sessionId) => {
    await axiosClientWithAuth.delete(`/api/v1/sessions/${sessionId}`);
  }
);

/**
 * Logout all other sessions
 * Terminate all sessions except current
 */
export const logoutOtherSessionsService = createApiThunk<void, string>(
  "sessions/logoutOthers",
  async (currentSessionId) => {
    await axiosClientWithAuth.post(
      `/api/v1/sessions/logout-others?currentSessionId=${currentSessionId}`
    );
  }
);

/**
 * Logout all sessions
 * Terminate all sessions including current (logout everywhere)
 */
export const logoutAllSessionsService = createApiThunk<void, void>(
  "sessions/logoutAll",
  async () => {
    await axiosClientWithAuth.post("/api/v1/sessions/logout-all");
  }
);

/**
 * Admin: Get all sessions paginated
 * For admins to view all user sessions with filtering
 */
export const adminGetSessionsService = createApiThunk<
  PaginatedSessionsResponse,
  SessionFilterRequest
>("sessions/adminGetAll", async (filterRequest) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/sessions/admin/all",
    filterRequest
  );
  return response.data.data;
});

/**
 * Admin: Get session by ID
 * View details of any session
 */
export const adminGetSessionByIdService = createApiThunk<
  AdminSessionResponse,
  string
>("sessions/adminGetById", async (sessionId) => {
  const response = await axiosClientWithAuth.get(
    `/api/v1/sessions/admin/${sessionId}`
  );
  return response.data.data;
});
