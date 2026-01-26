/**
 * Social Authentication Response Models
 */

export type OperationType = "LOGIN" | "REGISTRATION";

/**
 * Social authentication response
 * Returned after successful Telegram/Google login or registration
 */
export interface SocialAuthResponse {
  success: boolean;
  message: string;
  provider: string;
  userId: string;
  userIdentifier: string;
  userType: string;
  accessToken: string;
  refreshToken: string;
  socialId: string;
  socialUsername: string;
  syncedAt: string;
  operationType: OperationType;
  isNewUser: boolean;
}

/**
 * Social sync response
 * Returned after connecting/disconnecting social account
 */
export interface SocialSyncResponse {
  success: boolean;
  message: string;
  provider: string;
  syncedAt: string | null;
  telegramId: number | null;
  telegramUsername: string | null;
  googleId: string | null;
  googleEmail: string | null;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}
