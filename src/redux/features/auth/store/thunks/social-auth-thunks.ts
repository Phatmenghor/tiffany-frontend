/**
 * Social Auth Feature - Async Thunks
 * Redux thunks for Telegram/Google social authentication
 */

import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  SocialAuthRequest,
  RefreshTokenRequest,
  TelegramAuthData,
} from "../models/request/social-auth-request";
import {
  SocialAuthResponse,
  SocialSyncResponse,
  RefreshTokenResponse,
} from "../models/response/social-auth-response";

/**
 * Social authenticate thunk
 * For login/registration with Telegram or Google
 */
export const socialAuthenticateService = createApiThunk<
  SocialAuthResponse,
  SocialAuthRequest
>("auth/socialAuthenticate", async (request) => {
  const response = await axiosClient.post(
    "/api/v1/auth/social/authenticate",
    request
  );
  return response.data.data;
});

/**
 * Telegram authenticate helper
 * Converts Telegram widget data to API request
 */
export const telegramAuthenticateService = createApiThunk<
  SocialAuthResponse,
  {
    telegramData: TelegramAuthData;
    userType: string;
    businessId?: string;
    deviceInfo?: string;
  }
>("auth/telegramAuthenticate", async ({ telegramData, userType, businessId, deviceInfo }) => {
  const request: SocialAuthRequest = {
    provider: "TELEGRAM",
    accessToken: JSON.stringify(telegramData),
    userType: userType as "CUSTOMER" | "BUSINESS_USER" | "PLATFORM_USER",
    businessId: businessId || null,
    deviceInfo: deviceInfo || getDeviceInfo(),
    ipAddress: null, // Will be detected by server
  };

  const response = await axiosClient.post(
    "/api/v1/auth/social/authenticate",
    request
  );
  return response.data.data;
});

/**
 * Sync social account thunk
 * Link existing account to Telegram/Google
 */
export const syncSocialAccountService = createApiThunk<
  SocialSyncResponse,
  SocialAuthRequest
>("auth/syncSocialAccount", async (request) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/auth/social/sync",
    request
  );
  return response.data.data;
});

/**
 * Telegram sync helper
 * Converts Telegram widget data to sync request
 */
export const syncTelegramAccountService = createApiThunk<
  SocialSyncResponse,
  {
    telegramData: TelegramAuthData;
    userType: string;
  }
>("auth/syncTelegramAccount", async ({ telegramData, userType }) => {
  const request: SocialAuthRequest = {
    provider: "TELEGRAM",
    accessToken: JSON.stringify(telegramData),
    userType: userType as "CUSTOMER" | "BUSINESS_USER" | "PLATFORM_USER",
    businessId: null,
    deviceInfo: null,
    ipAddress: null,
  };

  const response = await axiosClientWithAuth.post(
    "/api/v1/auth/social/sync",
    request
  );
  return response.data.data;
});

/**
 * Unsync social account thunk
 * Disconnect Telegram/Google from account
 */
export const unsyncSocialAccountService = createApiThunk<
  SocialSyncResponse,
  "TELEGRAM" | "GOOGLE"
>("auth/unsyncSocialAccount", async (provider) => {
  const response = await axiosClientWithAuth.delete(
    `/api/v1/auth/social/sync/${provider}`
  );
  return response.data.data;
});

/**
 * Refresh token thunk
 * Get new access token using refresh token
 */
export const refreshTokenService = createApiThunk<
  RefreshTokenResponse,
  RefreshTokenRequest
>("auth/refreshToken", async (request) => {
  const response = await axiosClient.post("/api/v1/auth/refresh", request);
  return response.data.data;
});

/**
 * Logout thunk
 * Invalidate current session on server
 */
export const logoutService = createApiThunk<void, void>(
  "auth/logout",
  async () => {
    await axiosClientWithAuth.post("/api/v1/users/logout");
  }
);

/**
 * Helper function to get device info
 */
function getDeviceInfo(): string {
  if (typeof window === "undefined") return "Unknown Device";

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  // Detect browser
  let browser = "Unknown Browser";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  else if (userAgent.includes("Opera")) browser = "Opera";

  // Detect OS
  let os = "Unknown OS";
  if (platform.includes("Win")) os = "Windows";
  else if (platform.includes("Mac")) os = "macOS";
  else if (platform.includes("Linux")) os = "Linux";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";

  return `${browser} on ${os}`;
}
