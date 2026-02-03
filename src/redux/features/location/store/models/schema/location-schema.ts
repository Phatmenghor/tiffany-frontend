import { z } from "zod";

/**
 * Create Location Schema
 */
export const createLocationSchema = z.object({
  label: z.string().min(1, "Label is required"),
  latitude: z.number({ message: "Latitude is required" }),
  longitude: z.number({ message: "Longitude is required" }),
  houseNumber: z.string().min(1, "House number is required"),
  streetNumber: z.string().min(1, "Street is required"),
  village: z.string().min(1, "Village is required"),
  commune: z.string().min(1, "Commune is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),
  note: z.string().optional().default(""),
  isPrimary: z.boolean().default(false),
});

/**
 * Update Location Schema
 */
export const updateLocationSchema = createLocationSchema;

export type LocationFormData = z.infer<typeof createLocationSchema>;
