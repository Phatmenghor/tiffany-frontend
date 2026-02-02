import { z } from "zod";

/**
 * Create Sub Categories Schema
 */
export const createSubCategoriesSchema = z.object({
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().min(1, "image url is required"),
  categoriesId: z.string().min(1, "categoriesId id is required"),
  status: z.string().min(1, "status is required"),
});

/**
 * Update Sub Categories Schema
 */
export const updateSubCategoriesSchema = z.object({
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().min(1, "image url is required"),
  categoriesId: z.string().min(1, "categories id is required"),
  status: z.string().min(1, "status is required"),
});

export type SubCategoriesFormData = {
  id?: string;
  name: string;
  imageUrl: string;
  categoriesId: string;
  status: string;
};
