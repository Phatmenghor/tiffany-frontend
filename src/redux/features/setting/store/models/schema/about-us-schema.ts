import { z } from "zod";

/**
 * Update About us Schema
 */
export const updateAboutUsSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().min(1, "description is required"),
  mainImageUrl: z.string().min(1, "main image url is required"),
  contactInfo: z.string().or(z.literal("")),
  showroomHours: z.string().or(z.literal("")),
  phoneNumber: z.string().or(z.literal("")),
  email: z.string().or(z.literal("")),
  address: z.string().or(z.literal("")),
  facebookUrl: z.string().or(z.literal("")),
  instagramUrl: z.string().or(z.literal("")),
  websiteUrl: z.string().or(z.literal("")),
});

export type AboutUsFormData = {
  id?: string;
  title: string;
  description: string;
  mainImageUrl: string;
  contactInfo: string;
  showroomHours: string;
  phoneNumber: string;
  email: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  status: string;
};
