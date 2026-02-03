"use client";

import { useEffect } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { fetchCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { fetchFavoriteList } from "@/redux/features/main/store/thunks/favorite-thunks";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthState();
  const {
    dispatch: cartDispatch,
    loaded: cartLoaded,
    loading: cartLoading,
  } = useCartState();
  const {
    dispatch: favoriteDispatch,
    loaded: favoriteLoaded,
    loading: favoriteLoading,
  } = useFavoriteState();

  // Load cart and favorites when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (!cartLoaded && !cartLoading.fetch) {
        cartDispatch(fetchCart());
      }
      if (!favoriteLoaded && !favoriteLoading.fetch) {
        favoriteDispatch(fetchFavoriteList());
      }
    }
  }, [
    isAuthenticated,
    cartLoaded,
    cartLoading.fetch,
    favoriteLoaded,
    favoriteLoading.fetch,
    cartDispatch,
    favoriteDispatch,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar - Shared across all public pages */}
      <Navbar />

      {/* Main Content - Changes per page */}
      <main className="flex-1">{children}</main>

      {/* Footer - Shared across all public pages */}
      <Footer />
    </div>
  );
}
