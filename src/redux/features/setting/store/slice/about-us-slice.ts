import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AboutUsManagementState } from "../models/type/about-us-type";
import {
  fetchAboutUsService,
  updateAboutUsService,
} from "../thunks/about-us-thunks";

/**
 * Initial state
 */
const initialState: AboutUsManagementState = {
  selectedAboutUs: null,
  error: null,
  operations: {
    isUpdating: false,
    isFetchingDetail: false,
  },
};

/**
 * About Us slice
 */
const aboutUsSlice = createSlice({
  name: "about-us",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearSelectedAboutUs: (state) => {
      state.selectedAboutUs = null;
    },

    resetState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAboutUsService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedAboutUs = null;
      })
      .addCase(fetchAboutUsService.fulfilled, (state, action) => {
        state.selectedAboutUs = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchAboutUsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(updateAboutUsService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAboutUsService.fulfilled, (state, action) => {
        state.selectedAboutUs = action.payload;
        state.operations.isUpdating = false;
      })
      .addCase(updateAboutUsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });
  },
});

export const { clearError, clearSelectedAboutUs, resetState } =
  aboutUsSlice.actions;

export default aboutUsSlice.reducer;
