import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserManagementState } from "../models/type/users-types";
import { RoleManagementState } from "../models/type/role-types";
import {
  createRoleService,
  deleteRoleService,
  fetchAllRoleService,
  fetchRoleByIdService,
  updateRoleService,
} from "../thunks/role-thunks";
import { deleteUserService } from "../thunks/users-thunks";

/**
 * Initial state
 */
const initialState: RoleManagementState = {
  data: null,
  selectedRole: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    // Filter actions
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },

    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },

    // Utility actions
    clearError: (state) => {
      state.error = null;
    },

    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    resetState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRoleService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllRoleService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllRoleService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchRoleByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedRole = null;
      })
      .addCase(fetchRoleByIdService.fulfilled, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.selectedRole = action.payload;

        // Also update in list if exists (for consistency)
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (role) => role.id === action.payload.id,
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchRoleByIdService.rejected, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createRoleService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createRoleService.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize,
          );
        }
      })
      .addCase(createRoleService.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateRoleService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRoleService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedRole = action.payload;

        if (state.data) {
          state.data.content = state.data.content.map((role) =>
            role.id === action.payload.id ? action.payload : role,
          );
        }
      })
      .addCase(updateRoleService.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteRoleService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteRoleService.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        if (state.data) {
          state.data.content = state.data.content.filter(
            (role) => role.id !== action.payload,
          );
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize,
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
      })
      .addCase(deleteUserService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  clearSelectedRole,
  resetFilters,
  resetState,
} = roleSlice.actions;

export default roleSlice.reducer;
