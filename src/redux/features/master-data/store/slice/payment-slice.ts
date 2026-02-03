import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "@/constants/status/status";
import { PaymentManagementState } from "../models/type/payment-type";
import {
  createPaymentService,
  deletePaymentService,
  fetchAllPaymentService,
  fetchPaymentByIdService,
  updatePaymentService,
} from "../thunks/payment-thunks";

/**
 * Initial state
 */
const initialState: PaymentManagementState = {
  data: null,
  selectedPayment: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    isActive: null,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

/**
 * Payment slice
 */
const paymentSlice = createSlice({
  name: "payment-method",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },

    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setStatusFilter: (state, action: PayloadAction<Status>) => {
      state.filters.isActive =
        action.payload === Status.ALL
          ? null
          : action.payload === Status.ACTIVE
            ? true
            : false;
      state.filters.pageNo = 1;
    },

    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
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
      .addCase(fetchAllPaymentService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPaymentService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllPaymentService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchPaymentByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedPayment = null;
      })
      .addCase(fetchPaymentByIdService.fulfilled, (state, action) => {
        state.selectedPayment = action.payload;
        state.operations.isFetchingDetail = false;

        // Also update in list if exists (for consistency)
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (user) => user.id === action.payload.id,
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchPaymentByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createPaymentService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createPaymentService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize,
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createPaymentService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updatePaymentService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePaymentService.fulfilled, (state, action) => {
        state.selectedPayment = action.payload;
        state.operations.isUpdating = false;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user,
          );
        }
      })
      .addCase(updatePaymentService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deletePaymentService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePaymentService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = state.data.content.filter(
            (user) => user.id !== action.payload,
          );
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize,
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
        state.operations.isDeleting = false;
      })
      .addCase(deletePaymentService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  setStatusFilter,
  clearSelectedPayment,
  resetFilters,
  resetState,
} = paymentSlice.actions;

export default paymentSlice.reducer;
