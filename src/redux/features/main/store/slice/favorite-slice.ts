import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  items: WishlistItemResponseModel[];
  totalItems: number;
  loading: {
    fetch: boolean;
    add: boolean;
    remove: boolean;
  };
  error: string | null;
  loaded: boolean;
}

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  loading: {
    fetch: false,
    add: false,
    remove: false,
  },
  error: null,
  loaded: false,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.loaded = false;
      state.error = null;
    },
    toggleWishlistOptimistic: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.items.findIndex(
        (item) => item.productId === productId,
      );
      if (index >= 0) {
        state.items.splice(index, 1);
        state.totalItems = state.items.length;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(
        fetchWishlist.fulfilled,
        (state, action: PayloadAction<WishlistResponseModel>) => {
          state.loading.fetch = false;
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems || 0;
          state.loaded = true;
          state.error = null;
        },
      )
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.error.message || "Failed to fetch wishlist";
      })

      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading.add = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state) => {
        state.loading.add = false;
        state.error = null;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading.add = false;
        state.error = action.error.message || "Failed to add item to wishlist";
      })

      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading.remove = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading.remove = false;
        const productId = action.meta.arg.productId;
        state.items = state.items.filter(
          (item) => item.productId !== productId,
        );
        state.totalItems = state.items.length;
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading.remove = false;
        state.error =
          action.error.message || "Failed to remove item from wishlist";
      });
  },
});

export const { resetWishlist, toggleWishlistOptimistic } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
