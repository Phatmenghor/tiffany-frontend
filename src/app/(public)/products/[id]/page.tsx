"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  fetchPublicProductById,
  fetchPublicProducts,
} from "@/redux/features/main/store/thunks/public-product-thunks";
import { clearSelectedProduct } from "@/redux/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useWishlistState } from "@/redux/features/main/store/state/wishlist-state";
import { toggleFavorite } from "@/redux/features/main/store/thunks/favorite-thunks";
import { ProductCard } from "@/components/shared/card/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Share2,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";
import { useScrollToTop } from "@/hooks/use-scroll-restoration";
import { showToast } from "@/components/shared/common/show-toast";

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { dispatch, selectedProduct, loading } = usePublicProductState();
  const { isAuthenticated } = useAuthState();
  const { dispatch: wishlistDispatch } = useWishlistState();

  const productId = params.id as string;
  const product = selectedProduct;
  const isLoading = loading.detail;

  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Scroll to top on mount (detail page should always start at top)
  useScrollToTop();

  const [similarProducts, setSimilarProducts] = useState<
    ProductDetailResponseModel[]
  >([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

  // Get all images (main + additional)
  const allImages = product
    ? [
        { id: "main", imageUrl: product.mainImageUrl, displayOrder: 0 },
        ...(product.images || []).map((img, idx) => ({
          ...img,
          displayOrder: idx + 1,
        })),
      ]
    : [];

  // Initialize product and selected size
  useEffect(() => {
    if (productId) {
      dispatch(clearSelectedProduct());
      dispatch(fetchPublicProductById(productId));
    }
  }, [productId, dispatch]);

  // Set initial image and size
  useEffect(() => {
    if (product) {
      setSelectedImage(product.mainImageUrl);
      setCurrentImageIndex(0);
      setImageLoaded(false);

      // If product has sizes, select the first one by default
      if (product.hasSizes && product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize(null);
      }
    }
  }, [product]);

  // Load similar products
  useEffect(() => {
    if (product) {
      const loadSimilarProducts = async () => {
        try {
          const response = await dispatch(
            fetchPublicProducts({
              pageNo: 1,
              pageSize: 5,
              categoryId: product.categoryId || undefined,
              status: "ACTIVE",
            })
          ).unwrap();

          const similar =
            response.content?.filter((p: any) => p.id !== productId) || [];
          setSimilarProducts(similar.slice(0, 4));
        } catch (error) {
          console.error("Error loading similar products:", error);
        }
      };

      loadSimilarProducts();
    }
  }, [product, productId, dispatch]);

  // Image navigation
  const handlePrevImage = () => {
    const newIndex =
      currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    setSelectedImage(allImages[newIndex].imageUrl);
    setImageLoaded(false);
  };

  const handleNextImage = () => {
    const newIndex =
      currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    setSelectedImage(allImages[newIndex].imageUrl);
    setImageLoaded(false);
  };

  const handleSelectImage = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
    setImageLoaded(false);
  };

  // Get display price based on selected size or product
  const getDisplayPrice = () => {
    if (selectedSize) {
      return selectedSize.finalPrice;
    }
    return product?.displayPrice || 0;
  };

  const getOriginalPrice = () => {
    if (selectedSize && selectedSize.hasPromotion) {
      return selectedSize.price;
    }
    if (product?.hasPromotion && product.displayOriginPrice) {
      return product.displayOriginPrice;
    }
    return null;
  };

  const hasDiscount = selectedSize
    ? selectedSize.hasPromotion
    : product?.hasPromotion;

  // Toggle favorite handler
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast.error("Please login to add to wishlist");
      return;
    }
    if (!product) return;

    setIsTogglingFavorite(true);
    try {
      const wasFavorited = product.isFavorited;
      await wishlistDispatch(
        toggleFavorite({ productId: product.id }),
      ).unwrap();
      showToast.success(
        wasFavorited ? "Removed from wishlist" : "Added to wishlist",
      );
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update wishlist");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <CustomButton
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </CustomButton>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden border bg-muted/30 group">
              {!imageLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full" />
              )}
              <Image
                src={selectedImage || "https://picsum.photos/800/800"}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-opacity duration-500",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                priority
              />

              {/* Discount Badge */}
              {hasDiscount && (
                <Badge
                  variant="destructive"
                  className="absolute top-4 right-4 text-base font-bold px-3 py-1.5 shadow-lg"
                >
                  {selectedSize && selectedSize.hasPromotion
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

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </div>

            {/* Thumbnail Row - Max 90% height */}
            {allImages.length > 1 && (
              <div className="relative">
                <div
                  className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                  style={{ maxHeight: "90%" }}
                >
                  {allImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => handleSelectImage(img.imageUrl, index)}
                      className={cn(
                        "relative flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all cursor-pointer hover:scale-105",
                        selectedImage === img.imageUrl
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Image
                        src={img.imageUrl}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {selectedImage === img.imageUrl && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Badges */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {product.brandName && (
                  <Badge variant="secondary">{product.brandName}</Badge>
                )}
                <Badge variant="outline">{product.categoryName}</Badge>
                {product.status === "OUT_OF_STOCK" ? (
                  <Badge variant="destructive">Out of Stock</Badge>
                ) : (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    In Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Price Display */}
            <div className="bg-accent/50 rounded-lg p-4 border">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {formatCurrency(getDisplayPrice())}
                </span>
                {getOriginalPrice() && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(getOriginalPrice()!)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  You save{" "}
                  {formatCurrency(
                    (getOriginalPrice() || 0) - getDisplayPrice()
                  )}
                </p>
              )}
            </div>

            {/* Available Sizes - Only show if product has sizes */}
            {product.hasSizes && product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">Choose Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "relative border-2 rounded-lg px-4 py-3 transition-all cursor-pointer hover:border-primary hover:shadow-md",
                        selectedSize?.id === size.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border"
                      )}
                    >
                      <div className="font-semibold text-sm">{size.name}</div>
                      <div className="text-primary font-bold text-base">
                        {formatCurrency(size.finalPrice)}
                      </div>
                      {size.hasPromotion && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatCurrency(size.price)}
                        </div>
                      )}
                      {selectedSize?.id === size.id && (
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2 text-lg">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description ||
                  "No description available for this product."}
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Quantity</h3>
              <div className="flex items-center gap-4">
                <CustomButton
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </CustomButton>
                <span className="w-16 text-center font-bold text-xl">
                  {quantity}
                </span>
                <CustomButton
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </CustomButton>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <CustomButton
                size="lg"
                className="w-full h-12 text-base font-semibold"
                disabled={product.status === "OUT_OF_STOCK"}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart • {formatCurrency(getDisplayPrice() * quantity)}
              </CustomButton>

              <div className="grid grid-cols-2 gap-3">
                <CustomButton
                  size="lg"
                  variant="outline"
                  className={cn(
                    "h-12",
                    product.isFavorited &&
                      "bg-red-50 border-red-200 text-red-600 hover:bg-red-100",
                  )}
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 mr-2",
                      product.isFavorited && "fill-current",
                    )}
                  />
                  {product.isFavorited ? "Wishlisted" : "Wishlist"}
                </CustomButton>
                <CustomButton size="lg" variant="outline" className="h-12">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </CustomButton>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>SKU:</span>
                <span className="font-medium">
                  {product.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Views:</span>
                <span className="font-medium">
                  {product.viewCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Favorites:</span>
                <span className="font-medium">
                  {product.favoriteCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {similarProducts.map((similar) => (
                <ProductCard key={similar.id} product={similar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Skeleton className="h-10 w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="w-20 h-20 rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-3/4 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-32 w-full" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
