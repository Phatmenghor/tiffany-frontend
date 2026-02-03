import { RootState } from "@/redux/store";

export const selectLocationState = (state: RootState) => state.locations;

export const selectLocations = (state: RootState) =>
  state.locations.locations;

export const selectLocationIsLoading = (state: RootState) =>
  state.locations.isLoading;

export const selectLocationError = (state: RootState) =>
  state.locations.error;

export const selectLocationOperations = (state: RootState) =>
  state.locations.operations;
