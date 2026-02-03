// utils/local-storage/userInfo.ts
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { USER_INFO_KEY, USER_INFO_MAX_AGE } from "@/constants/storage-keys";

export function storeUserInfo(userInfo: any): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie(USER_INFO_KEY, JSON.stringify(userInfo), {
    maxAge: USER_INFO_MAX_AGE,
  });
}

export function getUserInfo() {
  const userInfo = getCookie(USER_INFO_KEY);

  if (userInfo) {
    try {
      return JSON.parse(userInfo as string);
    } catch (error) {
      console.error("Failed to parse user info:", error);
      return null;
    }
  }

  return null;
}

export function removeUserInfo(): void {
  deleteCookie(USER_INFO_KEY);
}
