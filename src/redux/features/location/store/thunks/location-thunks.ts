import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  CreateLocationRequest,
  UpdateLocationParams,
} from "../models/request/location-request";
import { LocationResponseModel } from "../models/response/location-response";

/**
 * Fetch all user locations
 */
export const fetchAllLocationsService = createApiThunk<
  LocationResponseModel[]
>("user-locations/fetchAll", async () => {
  const response = await axiosClientWithAuth.get("/api/v1/user-locations");
  return response.data.data;
});

/**
 * Create a new location
 */
export const createLocationService = createApiThunk<
  LocationResponseModel,
  CreateLocationRequest
>("user-locations/create", async (locationData) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/user-locations",
    locationData,
  );
  return response.data.data;
});

/**
 * Update an existing location
 */
export const updateLocationService = createApiThunk<
  LocationResponseModel,
  UpdateLocationParams
>("user-locations/update", async ({ locationId, locationData }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/user-locations/${locationId}`,
    locationData,
  );
  return response.data.data;
});

/**
 * Delete a location
 */
export const deleteLocationService = createApiThunk<
  LocationResponseModel,
  string
>("user-locations/delete", async (locationId) => {
  const response = await axiosClientWithAuth.delete(
    `/api/v1/user-locations/${locationId}`,
  );
  return response.data.data;
});
