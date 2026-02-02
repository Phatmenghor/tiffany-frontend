import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import {
  fetchPublicProducts,
  fetchPublicProductById,
  fetchPublicCategories,
  fetchPublicBrands,
} from "../thunks/public-product-thunks";
import {
  toggleFavorite,
  clearAllFavorites,
} from "../thunks/favorite-thunks";

interface PublicProductState {
  products: ProductDetailResponseModel[];
  selectedProduct: ProductDetailResponseModel | null;
  categories: any[];
  brands: any[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasMore: boolean;
  };
  loading: {
    list: boolean;
    detail: boolean;
    filters: boolean;
  };
  error: {
    list: string | null;
    detail: string | null;
    filters: string | null;
  };
  scrollY: number;
  loadedFilters: string; // Track what filters the products were loaded with
}

const initialState: PublicProductState = {
  products: [],
  selectedProduct: null,
  categories: [],
  brands: [],
  pagination: {
    currentPage: 1,
    pageSize: 30,
    totalPages: 0,
    totalElements: 0,
    hasMore: false,
  },
  loading: {
    list: false,
    detail: false,
    filters: false,
  },
  error: {
    list: null,
    detail: null,
    filters: null,
  },
  scrollY: 0,
  loadedFilters: "", // Initialize empty
};

const publicProductSlice = createSlice({
  name: "publicProducts",
  initialState,
  reducers: {
    setScrollY: (state, action: PayloadAction<number>) => {
      state.scrollY = action.payload;
    },

    setLoadedFilters: (state, action: PayloadAction<string>) => {
      state.loadedFilters = action.payload;
    },

    clearProducts: (state) => {
      state.products = [];
      state.pagination = initialState.pagination;
      state.scrollY = 0;
      state.loadedFilters = ""; // Clear loaded filters too
    },

    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    resetPublicProductState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicProducts.pending, (state) => {
        state.loading.list = true;
        state.error.list = null;
      })
      .addCase(fetchPublicProducts.fulfilled, (state, action) => {
        const newProducts = action.payload.content || [];
        const pageSize = action.payload.pageSize;

        // Memory optimization: Keep only last 3 pages of data (like YouTube)
        const MAX_PAGES_IN_MEMORY = 3;
        const maxItems = MAX_PAGES_IN_MEMORY * pageSize;

        // Append new products
        const updatedProducts = [...state.products, ...newProducts];

        // If we exceed the limit, remove oldest items
        if (updatedProducts.length > maxItems) {
          const itemsToRemove = updatedProducts.length - maxItems;
          state.products = updatedProducts.slice(itemsToRemove);
        } else {
          state.products = updatedProducts;
        }

        state.loading.list = false;
        state.pagination = {
          currentPage: action.payload.pageNo,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
          hasMore: !action.payload.last,
        };
      })
      .addCase(fetchPublicProducts.rejected, (state, action) => {
        state.loading.list = false;
        state.error.list = action.payload as string;
      });

    builder
      .addCase(fetchPublicProductById.pending, (state) => {
        state.loading.detail = true;
        state.error.detail = null;
      })
      .addCase(fetchPublicProductById.fulfilled, (state, action) => {
        state.loading.detail = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchPublicProductById.rejected, (state, action) => {
        state.loading.detail = false;
        state.error.detail = action.payload as string;
      });

    builder
      .addCase(fetchPublicCategories.pending, (state) => {
        state.loading.filters = true;
      })
      .addCase(fetchPublicCategories.fulfilled, (state, action) => {
        state.loading.filters = false;
        state.categories = action.payload;
      })
      .addCase(fetchPublicCategories.rejected, (state) => {
        state.loading.filters = false;
      });

    builder
      .addCase(fetchPublicBrands.pending, (state) => {
        state.loading.filters = true;
      })
      .addCase(fetchPublicBrands.fulfilled, (state, action) => {
        state.loading.filters = false;
        state.brands = action.payload;
      })
      .addCase(fetchPublicBrands.rejected, (state) => {
        state.loading.filters = false;
      });

    // Cross-slice: Toggle favorite (optimistic - flip immediately on pending)
    builder.addCase(toggleFavorite.pending, (state, action) => {
      const productId = action.meta.arg.productId;
      state.products.forEach((p) => {
        if (p.id === productId) p.isFavorited = !p.isFavorited;
      });
      if (state.selectedProduct?.id === productId) {
        state.selectedProduct.isFavorited = !state.selectedProduct.isFavorited;
      }
    });

    // Rollback on failure
    builder.addCase(toggleFavorite.rejected, (state, action) => {
      const productId = action.meta.arg.productId;
      state.products.forEach((p) => {
        if (p.id === productId) p.isFavorited = !p.isFavorited;
      });
      if (state.selectedProduct?.id === productId) {
        state.selectedProduct.isFavorited = !state.selectedProduct.isFavorited;
      }
    });

    // Cross-slice: Clear all favorites → set all isFavorited to false
    builder.addCase(clearAllFavorites.fulfilled, (state) => {
      state.products.forEach((p) => {
        p.isFavorited = false;
      });
      if (state.selectedProduct) {
        state.selectedProduct.isFavorited = false;
      }
    });
  },
});

export const {
  setScrollY,
  setLoadedFilters, // Export new action
  clearProducts,
  clearSelectedProduct,
  resetPublicProductState,
} = publicProductSlice.actions;

export default publicProductSlice.reducer;
