import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";

/**
 * Fetch About Us
 */
export const fetchAboutUsService = createApiThunk<any, string>(
  "about-us/fetchById",
  async () => {
    const response = await axiosClientWithAuth.get(`/api/v1/about-us`);
    return response.data.data;
  },
);

/**
 * Fetch About Us
 */
export const updateAboutUsService = createApiThunk<any, string>(
  "about-us/update",
  async (payload) => {
    const response = await axiosClientWithAuth.put(`/api/v1/about-us`, payload);
    return response.data.data;
  },
);
