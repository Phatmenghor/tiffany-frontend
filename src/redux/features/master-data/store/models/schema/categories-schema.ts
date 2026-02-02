import { z } from "zod";

/**
 * Create Categories Schema
 */
export const createCategoriesSchema = z.object({
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().min(1, "image url is required"),
  status: z.string().min(1, "status is required"),
});

/**
 * Update Categories Schema
 */
export const updateCategoriesSchema = z.object({
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().min(1, "image url is required"),
  status: z.string().min(1, "status is required"),
});

export type CategoriesFormData = {
  id?: string;
  name: string;
  imageUrl?: string;
  status: string;
};
