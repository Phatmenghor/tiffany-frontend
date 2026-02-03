"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { CustomButton } from "../button/custom-button";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import {
  addToCart,
  updateCartItem,
} from "@/redux/features/main/store/thunks/cart-thunks";
import { toggleFavorite } from "@/redux/features/main/store/thunks/favorite-thunks";
import { showToast } from "../common/show-toast";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { LoginModal } from "../modal/login-modal";
import { SizeSelectionModal } from "../modal/size-selection-modal";

interface ProductCardProps {
  product: ProductDetailResponseModel;
  className?: string;
}

// Global cache to track loaded images across all product cards
const imageLoadedCache = new Set<string>();

export function ProductCard({ product, className }: ProductCardProps) {
  const { dispatch: cartDispatch, items: cartItems } = useCartState();
  const { dispatch: favoriteDispatch } = useFavoriteState();
  const { isAuthenticated } = useAuthState();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Get current cart item for this product (without size)
  const cartItem = cartItems.find(
    (item) => item.productId === product.id && !item.productSizeId
  );
  const quantity = cartItem?.quantity || 0;

  // Check if product has any items in cart (including sized items)
  const totalInCart = cartItems
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  // Image URL (fallback automatically handled)
  const imageUrl = product.mainImageUrl || appImages.NoImage;

  // Image load/error state
  const [imageLoaded, setImageLoaded] = useState(
    imageLoadedCache.has(imageUrl)
  );
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    imageLoadedCache.add(imageUrl);
  };

  const handleImageError = () => {
    if (imageUrl !== appImages.NoImage) {
      setImageError(true);
      setImageLoaded(true); // hide skeleton
      imageLoadedCache.add(appImages.NoImage);
    }
  };

  // Cart handlers
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // If product has sizes, show size selection modal
    if (product.hasSizes && product.sizes && product.sizes.length > 0) {
      setShowSizeModal(true);
      return;
    }

    // Otherwise, add directly
    setIsAddingToCart(true);
    try {
      await cartDispatch(
        addToCart({ productId: product.id, quantity: 1 })
      ).unwrap();
      showToast.success("Added to cart");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has sizes, show size selection modal
    if (product.hasSizes && product.sizes && product.sizes.length > 0) {
      setShowSizeModal(true);
      return;
    }

    if (!cartItem) return;

    setIsAddingToCart(true);
    try {
      await cartDispatch(
        updateCartItem({
          productId: product.id,
          quantity: quantity + 1,
        })
      ).unwrap();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has sizes, show size selection modal for management
    if (product.hasSizes && product.sizes && product.sizes.length > 0) {
      setShowSizeModal(true);
      return;
    }

    if (!cartItem) return;

    setIsAddingToCart(true);
    try {
      // Use quantity 0 to remove item
      await cartDispatch(
        updateCartItem({
          productId: product.id,
          quantity: quantity - 1,
        })
      ).unwrap();
      if (quantity === 1) {
        showToast.success("Removed from cart");
      }
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Favorite handler - toggle only (auto add/remove)
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setIsTogglingFavorite(true);
    try {
      await favoriteDispatch(
        toggleFavorite({ productId: product.id })
      ).unwrap();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update favorites");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const isOutOfStock = product.status === "OUT_OF_STOCK";
  const isInCart = product.hasSizes ? totalInCart > 0 : quantity > 0;
  const displayQuantity = product.hasSizes ? totalInCart : quantity;

  return (
    <>
      <Link href={`/products/${product.id}`}>
        <div
          className={cn(
            "group relative bg-card rounded-lg border border-border hover:border-primary/30 overflow-hidden transition-colors duration-200 flex flex-col",
            isOutOfStock && "opacity-75",
            product?.hasActivePromotion && "ring-1 ring-amber-500/20",
            className
          )}
        >
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}

            <Image
              src={imageError ? appImages.NoImage : imageUrl}
              alt={product.name || "Product Image"}
              fill
              priority={imageLoadedCache.has(imageUrl)}
              loading={imageLoadedCache.has(imageUrl) ? undefined : "lazy"}
              className={cn(
                "object-cover transition-opacity duration-200",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />

            {/* Top badges */}
            {product?.hasActivePromotion && (
              <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none gap-2">
                <Badge
                  variant="destructive"
                  className="text-xs font-bold px-2 py-0.5 shadow-md pointer-events-auto"
                >
                  {product.displayPromotionType === "PERCENTAGE"
                    ? `-${product.displayPromotionValue}%`
                    : `-${formatCurrency(product.displayPromotionValue)}`}
                </Badge>
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none">
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold px-3 py-1"
                >
                  Out of Stock
                </Badge>
              </div>
            )}

            {/* Favorite button */}
            <div className="absolute top-2 right-2 z-20">
              <CustomButton
                size="icon"
                variant="secondary"
                className={cn(
                  "h-8 w-8 rounded-full shadow-md",
                  product?.isFavorited
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white hover:bg-red-50 hover:text-red-500"
                )}
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    product?.isFavorited && "fill-current"
                  )}
                />
              </CustomButton>
            </div>
          </div>

          {/* Product info */}
          <div className="p-3 flex flex-col flex-1">
            <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[40px]">
              {product.name}
            </h3>

            <div className="mt-auto">
              <div className="flex flex-col mb-2">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(product.displayPrice)}
                </span>
                {product.hasActivePromotion && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.displayOriginPrice)}
                  </span>
                )}
              </div>

              {isInCart ? (
                <div
                  className="flex items-center gap-2 w-full"
                  onClick={(e) => e.preventDefault()}
                >
                  <CustomButton
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleDecrement}
                    disabled={isAddingToCart}
                  >
                    <Minus className="h-3 w-3" />
                  </CustomButton>

                  <div className="flex-1 text-center h-8 px-2 bg-primary/10 text-primary font-semibold text-sm rounded border border-primary/20 flex items-center justify-center">
                    {displayQuantity}
                  </div>

                  <CustomButton
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground"
                    onClick={handleIncrement}
                    disabled={isAddingToCart}
                  >
                    <Plus className="h-3 w-3" />
                  </CustomButton>
                </div>
              ) : (
                <CustomButton
                  className="w-full gap-2"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isOutOfStock}
                  size="sm"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-xs font-semibold">Add to Cart</span>
                    </>
                  )}
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </Link>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <SizeSelectionModal
        open={showSizeModal}
        onOpenChange={setShowSizeModal}
        product={product}
      />
    </>
  );
}
