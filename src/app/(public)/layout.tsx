"use client";

import { useEffect } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useWishlistState } from "@/redux/features/main/store/state/wishlist-state";
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
    dispatch: wishlistDispatch,
    loaded: wishlistLoaded,
    loading: wishlistLoading,
  } = useWishlistState();

  // Load cart and wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (!cartLoaded && !cartLoading.fetch) {
        cartDispatch(fetchCart());
      }
      if (!wishlistLoaded && !wishlistLoading.fetch) {
        wishlistDispatch(fetchFavoriteList());
      }
    }
  }, [
    isAuthenticated,
    cartLoaded,
    cartLoading.fetch,
    wishlistLoaded,
    wishlistLoading.fetch,
    cartDispatch,
    wishlistDispatch,
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
