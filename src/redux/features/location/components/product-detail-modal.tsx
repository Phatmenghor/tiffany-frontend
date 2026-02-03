"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import {
  selectIsFetchingDetail,
  selectSelectedProduct,
} from "../store/selectors/location-selector";
import { fetchProductByIdService } from "../store/thunks/location-thunks";
import { clearSelectedProduct } from "../store/slice/location-slice";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/common/currency-format";

interface ProductDetailModalProps {
  productId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  productId,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const productData = useAppSelector(selectSelectedProduct);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || !isOpen) return;
      try {
        await dispatch(fetchProductByIdService(productId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [productId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedProduct());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title="Product Details"
      description={productData?.name || "Loading product information..."}
    >
      {productData ? (
        <div className="space-y-6">
          {/* Product Basic Information */}
          <DetailSection title="Product Information">
            <CustomAvatar
              imageUrl={productData.mainImageUrl}
              name={productData.name}
              size="xl"
            />

            <DetailRow label="Product Name" value={productData.name} />

            <DetailRow
              label="Description"
              value={productData.description || "---"}
            />

            <DetailRow
              label="Status"
              value={
                <Badge
                  variant={
                    productData.status === "ACTIVE" ? "default" : "secondary"
                  }
                >
                  {productData.status}
                </Badge>
              }
            />

            <DetailRow
              label="Category"
              value={productData.categoryName || "---"}
            />

            <DetailRow
              label="SubCategory"
              value={productData.subCategoryName || "---"}
            />
          </DetailSection>

          {/* Pricing Information */}
          <DetailSection title="Pricing Information">
            <DetailRow
              label="Base Price"
              value={formatCurrency(productData.price)}
            />

            {productData.hasActivePromotion && (
              <>
                <DetailRow
                  label="Promotion Type"
                  value={productData.displayPromotionType || "---"}
                />

                <DetailRow
                  label="Promotion Value"
                  value={
                    productData.displayPromotionType === "PERCENTAGE"
                      ? `${productData.displayPromotionValue}%`
                      : formatCurrency(productData.displayPromotionValue || 0)
                  }
                />

                <DetailRow
                  label="Promotion Period"
                  value={
                    productData.displayPromotionFromDate &&
                    productData.displayPromotionToDate
                      ? `${dateTimeFormat(
                          productData.displayPromotionFromDate,
                        )} - ${dateTimeFormat(
                          productData.displayPromotionToDate,
                        )}`
                      : "---"
                  }
                />

                <DetailRow
                  label="Display Price"
                  value={
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(productData.displayPrice)}
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        {formatCurrency(productData.displayOriginPrice)}
                      </span>
                    </div>
                  }
                />
              </>
            )}

            {!productData.hasActivePromotion && (
              <DetailRow
                label="Display Price"
                value={formatCurrency(productData.displayPrice)}
              />
            )}
          </DetailSection>

          {/* Product Images */}
          {productData.images && productData.images.length > 0 && (
            <DetailSection title="Product Images">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productData.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden border"
                  >
                    <img
                      src={image.imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Product Sizes */}
          {productData.hasSizes &&
            productData.sizes &&
            productData.sizes.length > 0 && (
              <DetailSection title="Available Sizes">
                <div className="space-y-3">
                  {productData.sizes.map((size) => (
                    <div
                      key={size.id}
                      className="p-4 border rounded-lg bg-muted/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{size.name}</h4>
                        <Badge
                          variant={size.hasPromotion ? "default" : "secondary"}
                        >
                          {size.hasPromotion ? "On Sale" : "Regular"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(size.price)}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-foreground">
                            Final Price:
                          </span>
                          <span className="ml-2 font-medium text-green-600">
                            {formatCurrency(size.finalPrice)}
                          </span>
                        </div>

                        {size.hasPromotion && (
                          <>
                            <div>
                              <span className="text-muted-foreground">
                                Promotion:
                              </span>
                              <span className="ml-2">
                                {size.promotionType === "PERCENTAGE"
                                  ? `${size.promotionValue}%`
                                  : formatCurrency(size.promotionValue || 0)}
                              </span>
                            </div>

                            <div>
                              <span className="text-muted-foreground">
                                Valid Until:
                              </span>
                              <span className="ml-2 text-xs">
                                {dateTimeFormat(size.promotionToDate ?? "")}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}

          {/* Statistics */}
          <DetailSection title="Statistics">
            <DetailRow
              label="View Count"
              value={productData.viewCount?.toLocaleString() || "0"}
            />

            <DetailRow
              label="Favorite Count"
              value={productData.favoriteCount?.toLocaleString() || "0"}
            />

            <DetailRow
              label="Is Favorited"
              value={
                <Badge
                  variant={productData.isFavorited ? "default" : "outline"}
                >
                  {productData.isFavorited ? "Yes" : "No"}
                </Badge>
              }
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Product ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {productData.id}
                </span>
              }
            />

            <DetailRow
              label="Created At"
              value={dateTimeFormat(productData.createdAt ?? "")}
            />

            <DetailRow
              label="Created By"
              value={productData.createdBy || "---"}
            />

            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(productData.updatedAt ?? "")}
            />

            <DetailRow
              label="Updated By"
              value={productData.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No product data available</p>
        </div>
      )}
    </DetailModal>
  );
}
