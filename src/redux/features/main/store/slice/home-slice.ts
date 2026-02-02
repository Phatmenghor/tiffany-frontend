import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BannerResponseModel } from "@/redux/features/master-data/store/models/response/banner-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
  fetchHomeBrands,
} from "../thunks/home-thunks";

interface SectionState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

interface PaginationState {
  currentPage: number;
  hasMore: boolean;
  totalPages: number;
}

interface HomePageState {
  // Data
  banners: BannerResponseModel[];
  categories: CategoriesResponseModel[];
  promotionProducts: ProductDetailResponseModel[];
  featuredProducts: ProductDetailResponseModel[];

  // Section states
  sections: {
    banners: SectionState;
    categories: SectionState;
    promotionProducts: SectionState;
    featuredProducts: SectionState;
    brands: SectionState;
  };

  // Pagination for featured products
  featuredPagination: PaginationState;

  // Page state
  initialLoadComplete: boolean;
  lastFetchTimestamp: number | null;

  // Simple scroll position - just one number
  scrollY: number;
}

const initialSectionState: SectionState = {
  loading: false,
  loaded: false,
  error: null,
};

const initialState: HomePageState = {
  banners: [],
  categories: [],
  promotionProducts: [],
  featuredProducts: [],
  sections: {
    banners: { ...initialSectionState },
    categories: { ...initialSectionState },
    promotionProducts: { ...initialSectionState },
    featuredProducts: { ...initialSectionState },
    brands: { ...initialSectionState },
  },
  featuredPagination: {
    currentPage: 1,
    hasMore: true,
    totalPages: 1,
  },
  initialLoadComplete: false,
  lastFetchTimestamp: null,
  scrollY: 0, // Simple!
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    // Simple action - just save the number
    setScrollY: (state, action: PayloadAction<number>) => {
      state.scrollY = action.payload;
    },

    setInitialLoadComplete: (state) => {
      state.initialLoadComplete = true;
      state.lastFetchTimestamp = Date.now();
    },

    resetFeaturedPagination: (state) => {
      state.featuredPagination = {
        currentPage: 1,
        hasMore: true,
        totalPages: 1,
      };
      state.featuredProducts = [];
      state.sections.featuredProducts.loaded = false;
    },

    forceRefresh: (state) => {
      state.banners = [];
      state.categories = [];
      state.promotionProducts = [];
      state.featuredProducts = [];
      state.sections = {
        banners: { ...initialSectionState },
        categories: { ...initialSectionState },
        promotionProducts: { ...initialSectionState },
        featuredProducts: { ...initialSectionState },
        brands: { ...initialSectionState },
      };
      state.featuredPagination = {
        currentPage: 1,
        hasMore: true,
        totalPages: 1,
      };
      state.initialLoadComplete = false;
      state.lastFetchTimestamp = null;
      state.scrollY = 0; // Reset scroll too
    },

    resetHomeState: () => initialState,
  },

  extraReducers: (builder) => {
    // Banners
    builder
      .addCase(fetchHomeBanners.pending, (state) => {
        state.sections.banners.loading = true;
        state.sections.banners.error = null;
      })
      .addCase(fetchHomeBanners.fulfilled, (state, action) => {
        state.banners = action.payload || [];
        state.sections.banners.loading = false;
        state.sections.banners.loaded = true;
      })
      .addCase(fetchHomeBanners.rejected, (state, action) => {
        state.sections.banners.loading = false;
        state.sections.banners.error = action.payload as string;
      });

    // Categories
    builder
      .addCase(fetchHomeCategories.pending, (state) => {
        state.sections.categories.loading = true;
        state.sections.categories.error = null;
      })
      .addCase(fetchHomeCategories.fulfilled, (state, action) => {
        state.categories = action.payload || [];
        state.sections.categories.loading = false;
        state.sections.categories.loaded = true;
      })
      .addCase(fetchHomeCategories.rejected, (state, action) => {
        state.sections.categories.loading = false;
        state.sections.categories.error = action.payload as string;
      });

    // Promotion Products
    builder
      .addCase(fetchHomePromotionProducts.pending, (state) => {
        state.sections.promotionProducts.loading = true;
        state.sections.promotionProducts.error = null;
      })
      .addCase(fetchHomePromotionProducts.fulfilled, (state, action) => {
        state.promotionProducts = action.payload.content || [];
        state.sections.promotionProducts.loading = false;
        state.sections.promotionProducts.loaded = true;
      })
      .addCase(fetchHomePromotionProducts.rejected, (state, action) => {
        state.sections.promotionProducts.loading = false;
        state.sections.promotionProducts.error = action.payload as string;
      });

    // Featured Products (Paginated)
    builder
      .addCase(fetchHomeFeaturedProducts.pending, (state) => {
        state.sections.featuredProducts.loading = true;
        state.sections.featuredProducts.error = null;
      })
      .addCase(fetchHomeFeaturedProducts.fulfilled, (state, action) => {
        const newProducts = action.payload.content || [];
        const pageSize = action.payload.pageSize || 20;

        // Memory optimization: Keep only last 3 pages of data (like YouTube)
        const MAX_PAGES_IN_MEMORY = 3;
        const maxItems = MAX_PAGES_IN_MEMORY * pageSize;

        // Append new products
        const updatedProducts = [...state.featuredProducts, ...newProducts];

        // If we exceed the limit, remove oldest items
        if (updatedProducts.length > maxItems) {
          const itemsToRemove = updatedProducts.length - maxItems;
          state.featuredProducts = updatedProducts.slice(itemsToRemove);
        } else {
          state.featuredProducts = updatedProducts;
        }

        state.featuredPagination.currentPage = action.payload.pageNo || 1;
        state.featuredPagination.totalPages = action.payload.totalPages || 1;
        state.featuredPagination.hasMore = !action.payload.last;
        state.sections.featuredProducts.loading = false;
        state.sections.featuredProducts.loaded = true;
      })
      .addCase(fetchHomeFeaturedProducts.rejected, (state, action) => {
        state.sections.featuredProducts.loading = false;
        state.sections.featuredProducts.error = action.payload as string;
      });
  },
});

export const {
  setScrollY,
  setInitialLoadComplete,
  resetFeaturedPagination,
  forceRefresh,
  resetHomeState,
} = homeSlice.actions;

export default homeSlice.reducer;
