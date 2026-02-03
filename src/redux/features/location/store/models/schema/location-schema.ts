import { z } from "zod";

/**
 * Create Location Schema
 */
export const createLocationSchema = z.object({
  label: z.string().min(1, "Label is required"),
  latitude: z.number({ message: "Latitude is required" }),
  longitude: z.number({ message: "Longitude is required" }),
  houseNumber: z.string().optional().default(""),
  streetNumber: z.string().optional().default(""),
  village: z.string().optional().default(""),
  commune: z.string().optional().default(""),
  district: z.string().optional().default(""),
  province: z.string().optional().default(""),
  country: z.string().optional().default(""),
  note: z.string().optional().default(""),
  isPrimary: z.boolean().default(false),
});

/**
 * Update Location Schema
 */
export const updateLocationSchema = createLocationSchema;

export type LocationFormData = z.infer<typeof createLocationSchema>;
