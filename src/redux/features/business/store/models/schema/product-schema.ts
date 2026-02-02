// product.schema.ts
import { z } from "zod";

/**
 * Image Schema
 */
export const imageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .or(z.string().min(1, "Image URL required")),
});

/**
 * Size Schema with Promotion Validation
 */
export const sizeSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Size name is required"),
    price: z.number().min(0, "Price must be positive"),
    promotionType: z.string().optional(),
    promotionValue: z
      .number()
      .min(0, "Promotion value must be positive")
      .optional(),
    promotionFromDate: z.string().optional(),
    promotionToDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // If promotion type is set and not "NONE", validate promotion fields
      if (data.promotionType && data.promotionType !== "NONE") {
        return (
          data.promotionValue !== undefined &&
          data.promotionValue > 0 &&
          data.promotionFromDate &&
          data.promotionFromDate !== "" &&
          data.promotionToDate &&
          data.promotionToDate !== ""
        );
      }
      return true;
    },
    {
      message:
        "Promotion value and dates are required when promotion type is selected",
      path: ["promotionValue"],
    },
  )
  .refine(
    (data) => {
      // Validate that end date is after start date
      if (
        data.promotionType &&
        data.promotionType !== "NONE" &&
        data.promotionFromDate &&
        data.promotionToDate
      ) {
        return (
          new Date(data.promotionToDate) > new Date(data.promotionFromDate)
        );
      }
      return true;
    },
    {
      message: "Promotion end date must be after start date",
      path: ["promotionToDate"],
    },
  );

/**
 * Base Product Schema (shared fields)
 */
const baseProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  subCategoryId: z.string().min(1, "Sub-category is required"),
  price: z.number().min(0, "Price must be positive").optional(),
  mainImageUrl: z
    .string()
    .url("Invalid main image URL")
    .or(z.string().min(1, "Main image required")),
  promotionType: z.string().optional(),
  promotionValue: z
    .number()
    .min(0, "Promotion value must be positive")
    .optional(),
  promotionFromDate: z.string().optional(),
  promotionToDate: z.string().optional(),

  images: z.array(imageSchema).optional().default([]),
  sizes: z.array(sizeSchema).optional().default([]),

  status: z.string().min(1, "Status is required"),
});

/**
 * Create Product Schema with Validations
 */
export const createProductSchema = baseProductSchema
  .refine(
    (data) => {
      // If no sizes, price is required
      if (!data.sizes || data.sizes.length === 0) {
        return data.price !== undefined && data.price >= 0;
      }
      return true;
    },
    {
      message: "Price is required when product has no sizes",
      path: ["price"],
    },
  )
  .refine(
    (data) => {
      // If no sizes and promotion type is set (not NONE), validate promotion fields
      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE"
      ) {
        return (
          data.promotionValue !== undefined &&
          data.promotionValue > 0 &&
          data.promotionFromDate &&
          data.promotionFromDate !== "" &&
          data.promotionToDate &&
          data.promotionToDate !== ""
        );
      }
      return true;
    },
    {
      message:
        "Promotion value and dates are required when promotion type is selected",
      path: ["promotionValue"],
    },
  )
  .refine(
    (data) => {
      // Validate that end date is after start date for main product
      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE" &&
        data.promotionFromDate &&
        data.promotionToDate
      ) {
        return (
          new Date(data.promotionToDate) > new Date(data.promotionFromDate)
        );
      }
      return true;
    },
    {
      message: "Promotion end date must be after start date",
      path: ["promotionToDate"],
    },
  );

/**
 * Update Product Schema with Validations
 */
export const updateProductSchema = baseProductSchema
  .extend({
    id: z.string().min(1, "Product ID is required"),
  })
  .refine(
    (data) => {
      // If no sizes, price is required
      if (!data.sizes || data.sizes.length === 0) {
        return data.price !== undefined && data.price >= 0;
      }
      return true;
    },
    {
      message: "Price is required when product has no sizes",
      path: ["price"],
    },
  )
  .refine(
    (data) => {
      // If no sizes and promotion type is set (not NONE), validate promotion fields
      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE"
      ) {
        return (
          data.promotionValue !== undefined &&
          data.promotionValue > 0 &&
          data.promotionFromDate &&
          data.promotionFromDate !== "" &&
          data.promotionToDate &&
          data.promotionToDate !== ""
        );
      }
      return true;
    },
    {
      message:
        "Promotion value and dates are required when promotion type is selected",
      path: ["promotionValue"],
    },
  )
  .refine(
    (data) => {
      // Validate that end date is after start date for main product
      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE" &&
        data.promotionFromDate &&
        data.promotionToDate
      ) {
        return (
          new Date(data.promotionToDate) > new Date(data.promotionFromDate)
        );
      }
      return true;
    },
    {
      message: "Promotion end date must be after start date",
      path: ["promotionToDate"],
    },
  );

/**
 * Combined form data type - includes all possible fields
 */
export type ProductFormData = {
  id?: string;
  name: string;
  description: string;
  subCategoryId: string;
  price: number;
  mainImageUrl: string;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
  images?: Array<{
    id?: string;
    imageUrl: string;
  }>;
  sizes?: Array<{
    id?: string;
    name: string;
    price: number;
    promotionType?: string;
    promotionValue?: number;
    promotionFromDate?: string;
    promotionToDate?: string;
  }>;
  status: string;
};

export type CreateProductData = z.infer<typeof createProductSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;
export type ImageData = z.infer<typeof imageSchema>;
export type SizeData = z.infer<typeof sizeSchema>;
