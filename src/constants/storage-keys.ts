/**
 * Centralized storage/cookie key constants
 * Use these constants instead of raw strings throughout the app
 */

// Authentication cookie keys
export const ACCESS_TOKEN_KEY = "auth-token-client";
export const USER_INFO_KEY = "user-info";

// Cookie max ages (in seconds)
export const ACCESS_TOKEN_MAX_AGE = 365 * 24 * 60 * 60; // 1 year
export const USER_INFO_MAX_AGE = 365 * 24 * 60 * 60; // 1 year
