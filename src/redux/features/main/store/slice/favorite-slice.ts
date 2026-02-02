import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { AllFavoriteResponseModel } from "../models/response/favorite-response";
import {
  fetchFavoriteList,
  toggleFavorite,
  clearAllFavorites,
} from "../thunks/favorite-thunks";

interface FavoriteState {
  items: ProductDetailResponseModel[];
  totalItems: number;
  loading: {
    fetch: boolean;
    toggle: boolean;
    clearAll: boolean;
  };
  error: string | null;
  loaded: boolean;
}

const initialState: FavoriteState = {
  items: [],
  totalItems: 0,
  loading: {
    fetch: false,
    toggle: false,
    clearAll: false,
  },
  error: null,
  loaded: false,
};

const favoriteSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetFavorites: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Service 1: Fetch Favorites List
      .addCase(fetchFavoriteList.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(
        fetchFavoriteList.fulfilled,
        (state, action: PayloadAction<AllFavoriteResponseModel>) => {
          state.loading.fetch = false;
          state.items = action.payload.content || [];
          state.totalItems = action.payload.totalElements || 0;
          state.loaded = true;
          state.error = null;
        },
      )
      .addCase(fetchFavoriteList.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = (action.payload as string) || "Failed to fetch favorites";
      })

      // Service 2: Toggle Favorite (dynamic - auto add/remove)
      .addCase(toggleFavorite.pending, (state) => {
        state.loading.toggle = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading.toggle = false;
        const productId = action.meta.arg.productId;
        const existingIndex = state.items.findIndex(
          (item) => item.id === productId,
        );
        if (existingIndex >= 0) {
          // Was in favorites → now removed
          state.items.splice(existingIndex, 1);
          state.totalItems = Math.max(0, state.totalItems - 1);
        } else {
          // Was not in favorites → now added (count +1, full item loads on next fetch)
          state.totalItems += 1;
        }
        state.error = null;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading.toggle = false;
        state.error =
          (action.payload as string) || "Failed to toggle favorite";
      })

      // Service 3: Clear all favorites
      .addCase(clearAllFavorites.pending, (state) => {
        state.loading.clearAll = true;
        state.error = null;
      })
      .addCase(clearAllFavorites.fulfilled, (state) => {
        state.loading.clearAll = false;
        state.items = [];
        state.totalItems = 0;
        state.error = null;
      })
      .addCase(clearAllFavorites.rejected, (state, action) => {
        state.loading.clearAll = false;
        state.error =
          (action.payload as string) || "Failed to clear favorites";
      });
  },
});

export const { resetFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
