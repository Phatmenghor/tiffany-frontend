"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Loader2, Minus, Plus, ShoppingCart, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { addToCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface ProductSize {
  id: string;
  name: string;
  price: number;
  promotionType: string | null;
  promotionValue: number | null;
  promotionFromDate: string | null;
  promotionToDate: string | null;
  finalPrice: number;
  hasPromotion: boolean;
  createdAt: string;
}

interface SizeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDetailResponseModel | null;
  onSuccess?: () => void;
}

export function SizeSelectionModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: SizeSelectionModalProps) {
  const { dispatch, loading } = useCartState();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Reset state when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
      setQuantity(1);
    }
    onOpenChange(newOpen);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await dispatch(
        addToCart({
          productId: product.id,
          productSizeId: selectedSize?.id || null,
          quantity,
        })
      ).unwrap();
      showToast.success("Added to cart");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to add to cart");
    }
  };

  if (!product) return null;

  const displayPrice = selectedSize?.finalPrice || product.displayPrice;
  const originalPrice = selectedSize?.hasPromotion
    ? selectedSize.price
    : product.hasActivePromotion
    ? product.displayOriginPrice
    : null;
  const hasDiscount = selectedSize
    ? selectedSize.hasPromotion
    : product.hasActivePromotion;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold">
            Select Size & Quantity
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-2">
          {/* Product Info */}
          <div className="flex gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={product.mainImageUrl || appImages.NoImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(displayPrice)}
                </span>
                {hasDiscount && originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <Badge variant="destructive" className="text-xs mt-1">
                  {selectedSize?.hasPromotion
                    ? `-${Math.round(
                        ((selectedSize.price - selectedSize.finalPrice) /
                          selectedSize.price) *
                          100
                      )}%`
                    : product.displayPromotionType === "PERCENTAGE"
                    ? `-${product.displayPromotionValue}%`
                    : `-${formatCurrency(product.displayPromotionValue || 0)}`}
                </Badge>
              )}
            </div>
          </div>

          {/* Size Selection */}
          {product.hasSizes && product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-sm">Choose Size</h4>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "relative border-2 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-primary",
                      selectedSize?.id === size.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border"
                    )}
                  >
                    <div className="font-semibold text-xs">{size.name}</div>
                    <div className="text-primary font-bold text-sm">
                      {formatCurrency(size.finalPrice)}
                    </div>
                    {size.hasPromotion && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatCurrency(size.price)}
                      </div>
                    )}
                    {selectedSize?.id === size.id && (
                      <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-sm">Quantity</h4>
            <div className="flex items-center gap-3">
              <CustomButton
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-9 w-9"
              >
                <Minus className="h-4 w-4" />
              </CustomButton>
              <span className="w-12 text-center font-bold text-lg">
                {quantity}
              </span>
              <CustomButton
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </CustomButton>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t mb-4">
            <span className="text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(displayPrice * quantity)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <CustomButton
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton
              className="flex-1 gap-2"
              onClick={handleAddToCart}
              disabled={loading.add || (product.hasSizes && !selectedSize)}
            >
              {loading.add ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </>
              )}
            </CustomButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
