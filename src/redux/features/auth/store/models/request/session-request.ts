/**
 * Session Management Request Models
 */

export type SessionStatus = "ACTIVE" | "LOGGED_OUT" | "EXPIRED";
export type DeviceType = "MOBILE" | "DESKTOP" | "TABLET" | "WEB";
export type SortDirection = "ASC" | "DESC";

/**
 * Admin session filter request
 * For filtering sessions in admin panel
 */
export interface SessionFilterRequest {
  search?: string;
  pageNo: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  userId?: string | null;
  statuses?: SessionStatus[];
  deviceTypes?: DeviceType[];
}
