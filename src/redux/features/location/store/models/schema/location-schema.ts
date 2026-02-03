import { z } from "zod";

/**
 * Create Location Schema
 */
export const createLocationSchema = z.object({
  label: z.string().min(1, "label is required"),
  latitude: z.string().or(z.literal("")),
  longitude: z.string().or(z.literal("")),
  houseNumber: z.string().or(z.literal("")),
  streetNumber: z.string().or(z.literal("")),
  village: z.string().or(z.literal("")),
  commune: z.string().or(z.literal("")),
  district: z.string().or(z.literal("")),
  province: z.string().or(z.literal("")),
  country: z.string().or(z.literal("")),
  note: z.string().or(z.literal("")),
  isPrimary: z.boolean().or(z.literal("")),
});

/**
 * Update Location Schema
 */
export const updateLocationSchema = z.object({
  label: z.string().min(1, "label is required"),
  latitude: z.string().or(z.literal("")),
  longitude: z.string().or(z.literal("")),
  houseNumber: z.string().or(z.literal("")),
  streetNumber: z.string().or(z.literal("")),
  village: z.string().or(z.literal("")),
  commune: z.string().or(z.literal("")),
  district: z.string().or(z.literal("")),
  province: z.string().or(z.literal("")),
  country: z.string().or(z.literal("")),
  note: z.string().or(z.literal("")),
  isPrimary: z.boolean().or(z.literal("")),
});

export type LocationFormData = {
  id?: string;
  label: string;
  latitude: number;
  longitude: number;
  houseNumber: string;
  streetNumber: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  country: string;
  note: string;
  isPrimary: boolean;
};
