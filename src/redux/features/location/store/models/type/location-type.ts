import { LocationResponseModel } from "../response/location-response";

export interface LocationOperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface LocationManagementState {
  locations: LocationResponseModel[];
  isLoading: boolean;
  error: string | null;
  operations: LocationOperationStates;
}
