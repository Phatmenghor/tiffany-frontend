import { deleteCookie, getCookie, setCookie } from "cookies-next";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/constants/storage-keys";

export function storeTokenRemember(token: string | undefined): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie(ACCESS_TOKEN_KEY, token, { maxAge: 365 * 24 * 60 * 60 });
}

export function getToken() {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return token;
}

export function storeToken(token: string | undefined): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie(ACCESS_TOKEN_KEY, token, { maxAge: ACCESS_TOKEN_MAX_AGE });
}

/**
 * Store refresh token in cookie
 */
export function storeRefreshToken(refreshToken: string | undefined): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie(REFRESH_TOKEN_KEY, refreshToken, { maxAge: REFRESH_TOKEN_MAX_AGE });
}

/**
 * Get refresh token from cookie
 */
export function getRefreshToken(): string | undefined {
  const token = getCookie(REFRESH_TOKEN_KEY);
  return token as string | undefined;
}

/**
 * Store both access and refresh tokens
 */
export function storeTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined
): void {
  storeToken(accessToken);
  storeRefreshToken(refreshToken);
}

/**
 * Logout the current user
 */
export function clearToken(): void {
  // Delete auth cookie
  deleteCookie(ACCESS_TOKEN_KEY);
}

/**
 * Clear refresh token
 */
export function clearRefreshToken(): void {
  deleteCookie(REFRESH_TOKEN_KEY);
}

/**
 * Clear all authentication tokens
 */
export function clearAllTokens(): void {
  clearToken();
  clearRefreshToken();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return !!token;
}

/**
 * Check if refresh token exists
 */
export function hasRefreshToken(): boolean {
  const token = getCookie(REFRESH_TOKEN_KEY);
  return !!token;
}

/**
 * Decode JWT token to get payload (without verification)
 */
export function decodeToken(token: string): {
  sub?: string;
  userId?: string;
  userType?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if access token is expired or about to expire
 * @param bufferSeconds - seconds before actual expiry to consider as expired (default 5 minutes)
 */
export function isTokenExpired(bufferSeconds: number = 300): boolean {
  const token = getToken();
  if (!token) return true;

  const decoded = decodeToken(token as string);
  if (!decoded?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + bufferSeconds;
}
