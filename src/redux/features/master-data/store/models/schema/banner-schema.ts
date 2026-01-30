import { z } from "zod";

/**
 * Create Banner Schema
 */
export const createBannerSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  linkUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
});

/**
 * Update Banner Schema
 */
export const updateBannerSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  linkUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
});

export type BannerFormData = {
  id?: string;
  imageUrl: string;
  linkUrl?: string;
  status: string;
};
