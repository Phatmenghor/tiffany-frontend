/**
 * Session Management Response Models
 */

import { DeviceType, SessionStatus } from "../request/session-request";

/**
 * User session response
 * Basic session info for regular users
 */
export interface UserSessionResponse {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  deviceDisplayName: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  country: string;
  city: string;
  status: SessionStatus;
  loginAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrentSession: boolean;
  sessionDurationMinutes: number;
  inactiveDurationMinutes: number;
}

/**
 * Admin session response
 * Extended session info for admins with user details
 */
export interface AdminSessionResponse extends UserSessionResponse {
  userId: string;
  userIdentifier: string;
  userFullName: string;
  userType: string;
  loggedOutAt: string | null;
  logoutReason: string | null;
}

/**
 * Paginated admin sessions response
 */
export interface PaginatedSessionsResponse {
  content: AdminSessionResponse[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
