/**
 * Store Reducers Configuration
 * Centralized configuration for all Redux reducers
 */

import authReducer from "../features/auth/store/slice/auth-slice";
import usersReducer from "../features/auth/store/slice/users-slice";

import bannerReducer from "../features/master-data/store/slice/banner-slice";
import categoriesReducer from "../features/master-data/store/slice/categories-slice";
import subCategoriesReducer from "../features/master-data/store/slice/sub-categories-slice";
import paymentReducer from "../features/master-data/store/slice/payment-slice";

import productReducer from "../features/business/store/slice/product-slice";
import homeReducer from "../features/main/store/slice/home-slice";
import publicProductReducer from "../features/main/store/slice/public-product-slice";
import publicBrandsReducer from "../features/main/store/slice/public-brands-slice";
import publicCategoriesReducer from "../features/main/store/slice/public-categories-slice";
import scrollReducer from "../features/main/store/slice/scroll-slice";
import cartReducer from "../features/main/store/slice/cart-slice";
import favoritesReducer from "../features/main/store/slice/favorite-slice";
import globalSettingsReducer from "./slices/global-settings-slice";

import aboutUsReducer from "../features/setting/store/slice/about-us-slice";
import locationReducer from "../features/location/store/slice/location-slice";

/**
 * Root reducer configuration
 * Add new feature reducers here
 */
export const reducers = {
  // Global Settings
  globalSettings: globalSettingsReducer,

  // Auth
  auth: authReducer,
  users: usersReducer,

  // Master Data (Admin)
  banner: bannerReducer,
  categories: categoriesReducer,
  subCategories: subCategoriesReducer,
  payment: paymentReducer,

  // Business
  products: productReducer,

  // Setting
  aboutUs: aboutUsReducer,

  // Location
  locations: locationReducer,

  // Main/Public
  home: homeReducer,
  publicProducts: publicProductReducer,
  publicBrands: publicBrandsReducer,
  publicCategories: publicCategoriesReducer,
  scroll: scrollReducer,
  cart: cartReducer,
  favorites: favoritesReducer,
};
