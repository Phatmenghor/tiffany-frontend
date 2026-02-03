import { createSlice } from "@reduxjs/toolkit";
import { LocationManagementState } from "../models/type/location-type";
import {
  fetchAllLocationsService,
  createLocationService,
  updateLocationService,
  deleteLocationService,
} from "../thunks/location-thunks";

/**
 * Initial state
 */
const initialState: LocationManagementState = {
  locations: [],
  isLoading: true,
  error: null,
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  },
};

/**
 * Location slice
 */
const locationSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    clearLocationError: (state) => {
      state.error = null;
    },
    resetLocationState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // Fetch all locations
    builder
      .addCase(fetchAllLocationsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllLocationsService.fulfilled, (state, action) => {
        state.locations = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllLocationsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    // Create location
    builder
      .addCase(createLocationService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createLocationService.fulfilled, (state, action) => {
        // If new location is primary, unset primary on all others
        if (action.payload.isPrimary) {
          state.locations = state.locations.map((loc) => ({
            ...loc,
            isPrimary: false,
          }));
        }
        state.locations.unshift(action.payload);
        state.operations.isCreating = false;
      })
      .addCase(createLocationService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    // Update location
    builder
      .addCase(updateLocationService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateLocationService.fulfilled, (state, action) => {
        // If updated location is primary, unset primary on all others
        if (action.payload.isPrimary) {
          state.locations = state.locations.map((loc) => ({
            ...loc,
            isPrimary: loc.id === action.payload.id,
          }));
        }
        // Update the location in list
        state.locations = state.locations.map((loc) =>
          loc.id === action.payload.id ? action.payload : loc,
        );
        state.operations.isUpdating = false;
      })
      .addCase(updateLocationService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    // Delete location
    builder
      .addCase(deleteLocationService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteLocationService.fulfilled, (state, action) => {
        state.locations = state.locations.filter(
          (loc) => loc.id !== action.payload.id,
        );
        state.operations.isDeleting = false;
      })
      .addCase(deleteLocationService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
      });
  },
});

export const { clearLocationError, resetLocationState } =
  locationSlice.actions;

export default locationSlice.reducer;
