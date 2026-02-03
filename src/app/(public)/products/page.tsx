"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchPublicProducts,
  fetchPublicCategories,
  fetchPublicBrands,
} from "@/redux/features/main/store/thunks/public-product-thunks";
import {
  clearProducts,
  setLoadedFilters,
} from "@/redux/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { CheckCircle2, Loader2 } from "lucide-react";
import { ProductFilters } from "@/redux/features/main/components/product/product-filters";
import { PageContainer } from "@/components/shared/common/page-container";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const observerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const { dispatch, products, pagination, loading, categories, loadedFilters } =
    usePublicProductState();

  const [page, setPage] = useState(1);

  // Use responsive skeleton count for pagination
  const skeletonCount = useSkeletonCount(SkeletonPresets.productGrid);

  // Smart scroll: Keep position on navigation, reset on browser refresh
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "products",
    restoreDelay: 150,
  });

  // Maintain scroll position during load more (YouTube-like)
  const isPaginationLoading = products.length > 0 && loading.list;
  const { containerRef } = useScrollAnchor(isPaginationLoading);

  const search = searchParams.get("q");
  const hasPromotion = searchParams.get("hasPromotion") === "true";
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");

  // Create a filter key from URL params
  const currentFilters = JSON.stringify({
    search,
    hasPromotion,
    categoryId,
    brandId,
    status,
    sortBy,
  });

  // Fetch categories and brands once
  useEffect(() => {
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicBrands());
  }, [dispatch]);

  const loadProducts = useCallback(
    async (pageNo: number) => {
      await dispatch(
        fetchPublicProducts({
          pageNo,
          pageSize: 40,
          ...(search && { search }),
          ...(hasPromotion && { hasPromotion: true }),
          ...(categoryId && { categoryId }),
          ...(brandId && { brandId }),
          ...(status && { status }),
          ...(sortBy && { sortBy }),
        }),
      );
    },
    [dispatch, search, hasPromotion, categoryId, brandId, status, sortBy],
  );

  // Smart loading based on Redux loadedFilters
  useEffect(() => {
    const hasProducts = products.length > 0;
    const filtersMatch = loadedFilters === currentFilters;

    if (hasProducts && filtersMatch) {
      return;
    }

    // Case 2: Filters changed OR no products -> Load/Reload
    if (!filtersMatch || !hasProducts) {
      if (!filtersMatch && hasProducts) {
        dispatch(clearProducts());
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      setPage(1);
      dispatch(setLoadedFilters(currentFilters));
      loadProducts(1);
    }
  }, [currentFilters, loadedFilters, products.length, loadProducts, dispatch]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !loading.list && !isLoadingRef.current) {
      isLoadingRef.current = true;
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [pagination.hasMore, loading.list, page, loadProducts]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!observerRef.current || !pagination.hasMore || loading.list) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          pagination.hasMore &&
          !loading.list &&
          !isLoadingRef.current
        ) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [pagination.hasMore, loading.list, handleLoadMore]);

  const isInitialLoad = products.length === 0 && loading.list;

  return (
    <PageContainer className="py-8 max-w-8xl">
      <div className="flex gap-6 lg:gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 h-[calc(100vh-7rem)]">
            <ProductFilters
              categories={categories}
              totalResults={pagination.totalElements}
            />
          </div>
        </aside>

        {/* Main Product List */}
        <div className="flex-1 min-w-0">
          {/* Mobile Filters */}
          <div className="lg:hidden mb-6">
            <ProductFilters
              categories={categories}
              totalResults={pagination.totalElements}
            />
          </div>

          {/* Initial Loading */}
          {isInitialLoad && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 20 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Products Grid */}
          {!isInitialLoad && products.length > 0 && (
            <div ref={containerRef}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}

                {/* Show skeleton cards while loading more (smooth like YouTube) */}
                {isPaginationLoading &&
                  Array.from({ length: skeletonCount }).map((_, index) => (
                    <ProductCardSkeleton key={`loading-${index}`} />
                  ))}
              </div>

              {/* Loading indicator with icon */}
              {isPaginationLoading && (
                <div className="flex items-center justify-center py-6 mt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading more products...</span>
                  </div>
                </div>
              )}

              {/* Infinite scroll trigger - hidden */}
              {pagination.hasMore && !loading.list && (
                <div ref={observerRef} className="h-10" />
              )}

              {!pagination.hasMore && products.length > 0 && (
                <div className="flex flex-col items-center justify-center mt-10 py-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    You've seen it all!
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    You've reached the end of products. Check back later for new
                    arrivals!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {!isInitialLoad && products.length === 0 && (
            <div className="text-center py-16">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 mx-auto">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {search
                  ? `No results for "${search}". Try different keywords.`
                  : "Try adjusting your filters or check back later"}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
