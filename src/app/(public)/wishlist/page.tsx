"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useWishlistState } from "@/redux/features/main/store/state/wishlist-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  fetchWishlist,
  removeFromWishlist,
} from "@/redux/features/main/store/thunks/favorite-thunks";
import { addToCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const { dispatch, items, totalItems, loading, loaded } = useWishlistState();
  const { dispatch: cartDispatch } = useCartState();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      showToast.error("Please login to view your wishlist");
      return;
    }

    if (!loaded && !loading.fetch) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, loaded, loading.fetch, dispatch, router]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await dispatch(removeFromWishlist({ productId })).unwrap();
      showToast.success("Removed from wishlist");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to remove from wishlist");
    }
  };

  const handleMoveToCart = async (productId: string, productName: string) => {
    try {
      await cartDispatch(addToCart({ productId, quantity: 1 })).unwrap();
      await dispatch(removeFromWishlist({ productId })).unwrap();
      showToast.success("Moved to cart");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to move to cart");
    }
  };

  if (loading.fetch && !loaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-64 bg-muted rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-50 mx-auto mb-6">
            <Heart className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Save your favorite items here to buy them later or share with
            friends
          </p>
          <CustomButton
            onClick={() => router.push("/products")}
            size="lg"
            className="gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Start Shopping
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"} saved
            </p>
          </div>
          <CustomButton
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </CustomButton>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard product={item.product} />

              {/* Quick Actions Overlay */}
              <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/95 to-transparent p-3 rounded-b-lg flex flex-col gap-2">
                <CustomButton
                  size="sm"
                  className="w-full gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMoveToCart(item.productId, item.product.name);
                  }}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Add to Cart
                </CustomButton>
                <CustomButton
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFromWishlist(item.productId);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </CustomButton>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-12 flex justify-center gap-4">
          <CustomButton
            size="lg"
            onClick={() => router.push("/products")}
            className="gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Continue Shopping
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
