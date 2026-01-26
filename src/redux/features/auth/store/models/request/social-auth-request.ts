/**
 * Social Authentication Request Models
 * For Telegram and Google social login/registration
 */

export type SocialProvider = "TELEGRAM" | "GOOGLE";
export type UserType = "CUSTOMER" | "BUSINESS_USER" | "PLATFORM_USER";

/**
 * Telegram auth data structure from Telegram Login Widget
 */
export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Social authentication request
 * Used for both login/registration and account sync
 */
export interface SocialAuthRequest {
  provider: SocialProvider;
  accessToken: string; // JSON stringified auth data for Telegram
  userType: UserType;
  businessId?: string | null;
  deviceInfo?: string | null;
  ipAddress?: string | null;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}
