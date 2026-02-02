/**
 * home-state.ts
 */

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectHomeBanners,
  selectHomeCategories,
  selectHomePromotionProducts,
  selectHomeFeaturedProducts,
  selectBannersSection,
  selectCategoriesSection,
  selectPromotionProductsSection,
  selectFeaturedProductsSection,
  selectFeaturedPagination,
  selectScrollY,
  selectAllSectionsLoaded,
} from "../selectors/home-selector";

export const useHomeState = () => {
  const dispatch = useAppDispatch();

  return {
    dispatch,
    banners: useAppSelector(selectHomeBanners),
    categories: useAppSelector(selectHomeCategories),
    promotionProducts: useAppSelector(selectHomePromotionProducts),
    featuredProducts: useAppSelector(selectHomeFeaturedProducts),
    bannersSection: useAppSelector(selectBannersSection),
    categoriesSection: useAppSelector(selectCategoriesSection),
    promotionProductsSection: useAppSelector(selectPromotionProductsSection),
    featuredProductsSection: useAppSelector(selectFeaturedProductsSection),
    featuredPagination: useAppSelector(selectFeaturedPagination),
    scrollY: useAppSelector(selectScrollY),
    allSectionsLoaded: useAppSelector(selectAllSectionsLoaded),
  };
};
