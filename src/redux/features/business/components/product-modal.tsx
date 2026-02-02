"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchProductByIdService,
  createProductService,
  updateProductService,
} from "../store/thunks/product-thunks";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { clearError, clearSelectedProduct } from "../store/slice/product-slice";
import {
  selectError,
  selectOperations,
  selectSelectedProduct,
  selectIsFetchingDetail,
} from "../store/selectors/product-selector";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, ProductStatus } from "@/constants/status/status";
import {
  PRODUCT_STATUS_CREATE_UPDATE,
  PROMOTION_TYPE_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import {
  createProductSchema,
  ProductFormData,
  updateProductSchema,
} from "../store/models/schema/product-schema";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { Loading } from "@/components/shared/common/loading";
import { ComboboxSelectSubCategories } from "@/components/shared/combobox/combobox_select_sub_categories";
import { SubCategoriesResponseModel } from "../../master-data/store/models/response/sub-categories-response";

type Props = {
  mode: ModalMode;
  productId?: string;
  onClose: () => void;
  isOpen: boolean;
};

const MAX_PRODUCT_IMAGES = 5;

export default function ProductModal({
  isOpen,
  onClose,
  productId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const productData = useAppSelector(selectSelectedProduct);
  const { isCreating, isUpdating } = operations;

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategoriesResponseModel | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(
      isCreate ? createProductSchema : updateProductSchema,
    ) as any,
    defaultValues: {
      id: "",
      name: "",
      description: "",
      subCategoryId: "",
      price: 0,
      mainImageUrl: "",
      promotionType: "NONE",
      promotionValue: undefined,
      promotionFromDate: "",
      promotionToDate: "",
      images: [],
      sizes: [],
      status: ProductStatus.ACTIVE,
    },
    mode: "onChange",
  });

  // Field arrays for images and sizes
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: "sizes",
  });

  const productName = watch("name");
  const mainImageUrl = watch("mainImageUrl");
  const promotionType = watch("promotionType");
  const hasSizes = sizeFields.length > 0;
  const showPromotionFields = promotionType && promotionType !== "NONE";

  // Calculate remaining slots
  const remainingSlots = MAX_PRODUCT_IMAGES - imageFields.length;
  const canAddMore = imageFields.length < MAX_PRODUCT_IMAGES;

  // Handle multiple image uploads with max limit
  const handleMultipleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (imageFields.length >= MAX_PRODUCT_IMAGES) {
      showToast.error(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`);
      event.target.value = "";
      return;
    }

    // Calculate how many files we can actually accept
    const availableSlots = MAX_PRODUCT_IMAGES - imageFields.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    if (files.length > availableSlots) {
      showToast.warning(
        `Only ${availableSlots} slot${
          availableSlots > 1 ? "s" : ""
        } remaining. Processing first ${availableSlots} image${
          availableSlots > 1 ? "s" : ""
        }.`,
      );
    }

    setIsProcessingImages(true);

    try {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const results = await Promise.all(
        filesToProcess.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            return { success: false, error: `${file.name} is not an image` };
          }
          if (file.size > maxSize) {
            return { success: false, error: `${file.name} exceeds 5MB` };
          }
          try {
            const base64 = await fileToBase64(file);
            return { success: true, base64 };
          } catch {
            return { success: false, error: `Failed to process ${file.name}` };
          }
        }),
      );

      const successfulImages = results.filter(
        (r): r is { success: true; base64: string } => r.success,
      );
      const failedImages = results.filter(
        (r): r is { success: false; error: string } => !r.success,
      );

      if (successfulImages.length > 0) {
        successfulImages.forEach((img) => {
          appendImage({ imageUrl: img.base64 });
        });
        showToast.success(
          `Added ${successfulImages.length} image${
            successfulImages.length > 1 ? "s" : ""
          }`,
        );
      }

      if (failedImages.length > 0) {
        showToast.error(`${failedImages.length} image(s) failed to upload`);
      }
    } catch (error) {
      showToast.error("Failed to process images");
    } finally {
      setIsProcessingImages(false);
      event.target.value = "";
    }
  };

  // Fetch product data for edit mode
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchProductByIdService(productId));

        if (fetchProductByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          if (data.subCategoryId) {
            setSelectedSubCategory({
              id: data.subCategoryId,
              name: data.subCategoryName,
            } as SubCategoriesResponseModel);
          }

          reset({
            id: data.id,
            name: data.name || "",
            description: data.description || "",
            subCategoryId: data.categoryId || "",
            price: data.price || 0,
            mainImageUrl: data.mainImageUrl || "",
            promotionType: data.promotionType || "NONE",
            promotionValue: data.promotionValue || undefined,
            promotionFromDate: data.promotionFromDate || "",
            promotionToDate: data.promotionToDate || "",
            images: data.images || [],
            sizes: data.sizes || [],
            status: data.status || ProductStatus.ACTIVE,
          });
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [productId, isOpen, isCreate, reset, dispatch]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      setSelectedSubCategory(null);
      reset({
        name: "",
        description: "",
        subCategoryId: "",
        price: 0,
        mainImageUrl: "",
        promotionType: "NONE",
        promotionValue: undefined,
        promotionFromDate: "",
        promotionToDate: "",
        images: [],
        sizes: [],
        status: ProductStatus.ACTIVE,
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  // Helper function to clean promotion data
  const cleanPromotionData = (
    promotionType?: string,
    promotionValue?: number,
    promotionFromDate?: string,
    promotionToDate?: string,
  ) => {
    if (!promotionType || promotionType === "NONE") {
      return {
        promotionType: null,
        promotionValue: null,
        promotionFromDate: null,
        promotionToDate: null,
      };
    }

    return {
      promotionType: promotionType || undefined,
      promotionValue: promotionValue || undefined,
      promotionFromDate: promotionFromDate || undefined,
      promotionToDate: promotionToDate || undefined,
    };
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsUploadingImage(true);

      // Upload main image if it's base64
      let finalMainImageUrl = data.mainImageUrl;
      if (finalMainImageUrl && isBase64Image(finalMainImageUrl)) {
        try {
          finalMainImageUrl = await uploadImage(finalMainImageUrl);
        } catch (uploadError) {
          showToast.error("Failed to upload main image");
          setIsUploadingImage(false);
          return;
        }
      }

      // Upload product images
      const processedImages = await Promise.all(
        (data.images || []).map(async (img: any) => {
          if (!img.imageUrl) return null;

          let imageUrl = img.imageUrl;
          if (isBase64Image(imageUrl)) {
            try {
              imageUrl = await uploadImage(imageUrl);
            } catch (error) {
              console.error("Failed to upload product image:", error);
              return null;
            }
          }

          return {
            id: img.id,
            imageUrl,
          };
        }),
      );

      const validImages = processedImages.filter(
        (img: any): img is { id?: string; imageUrl: string } =>
          img !== null && !!img.imageUrl,
      );

      setIsUploadingImage(false);

      // Clean sizes data
      const cleanedSizes = (data.sizes || []).map((size) => ({
        id: size.id,
        name: size.name,
        price: size.price,
        ...cleanPromotionData(
          size.promotionType,
          size.promotionValue,
          size.promotionFromDate,
          size.promotionToDate,
        ),
      }));

      // Prepare base payload
      const basePayload = {
        name: data.name,
        description: data.description,
        subCategoryId: data.subCategoryId,
        mainImageUrl: finalMainImageUrl,
        images: validImages.length > 0 ? validImages : undefined,
        sizes: cleanedSizes.length > 0 ? cleanedSizes : undefined,
        status: data.status,
      };

      // If product has sizes, pricing comes from sizes
      const payload = hasSizes
        ? {
            ...basePayload,
            price: null,
            promotionType: null,
            promotionValue: null,
            promotionFromDate: null,
            promotionToDate: null,
          }
        : {
            ...basePayload,
            price: data.price,
            ...cleanPromotionData(
              data.promotionType,
              data.promotionValue,
              data.promotionFromDate,
              data.promotionToDate,
            ),
          };

      if (isCreate) {
        await dispatch(createProductService(payload as any)).unwrap();
        showToast.success("Product created successfully");
        handleClose();
      } else {
        await dispatch(
          updateProductService({
            productId: data.id!,
            productData: payload as any,
          }),
        ).unwrap();
        showToast.success("Product updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message || `Failed to ${isCreate ? "create" : "update"} product`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    setIsProcessingImages(false);
    setSelectedSubCategory(null);
    dispatch(clearError());
    dispatch(clearSelectedProduct());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage || isProcessingImages;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95%] max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Product" : "Edit Product"}
          description={
            isCreate
              ? "Fill out the form to create a new product"
              : "Update product information below"
          }
          avatarName={productName}
          avatarImageUrl={mainImageUrl}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Main Product Image */}
                <div className="space-y-3">
                  <ClickableImageUpload
                    label="Main Product Image"
                    value={mainImageUrl}
                    onChange={(base64) =>
                      setValue("mainImageUrl", base64, { shouldDirty: true })
                    }
                    aspectRatio="square"
                    height="h-56"
                    maxSize={5}
                    required
                    error={errors.mainImageUrl}
                    placeholder="Click to upload main product image"
                    helperText="PNG, JPG up to 5MB"
                  />
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="name"
                      label="Product Name"
                      placeholder="Enter product name"
                      required
                      disabled={isProcessing}
                      error={errors.name}
                    />

                    <ComboboxSelectSubCategories
                      dataSelect={selectedSubCategory}
                      onChangeSelected={(category) => {
                        setSelectedSubCategory(category);
                        setValue("subCategoryId", category?.id || "", {
                          shouldDirty: true,
                        });
                      }}
                      label="Sub-Category"
                      placeholder="Select category"
                      required
                      disabled={isProcessing}
                      error={errors.subCategoryId?.message}
                      showAllOption={false}
                    />

                    <SelectField
                      control={control}
                      name="status"
                      label="Status"
                      placeholder="Select status"
                      options={PRODUCT_STATUS_CREATE_UPDATE}
                      required
                      disabled={isProcessing}
                      error={errors.status}
                    />

                    <div className="col-span-2">
                      <TextareaField
                        control={control}
                        name="description"
                        label="Description"
                        placeholder="Enter product description"
                        rows={4}
                        required
                        disabled={isProcessing}
                        error={errors.description}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Section - Only show if no sizes */}
                {!hasSizes && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="text-lg font-semibold">
                      Pricing Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField
                        control={control}
                        name="price"
                        label="Base Price"
                        type="number"
                        placeholder="Enter price"
                        required
                        disabled={isProcessing}
                        error={errors.price}
                        valueAsNumber={true}
                        min={0}
                        step="0.01"
                        allowZero={true}
                      />

                      <SelectField
                        control={control}
                        name="promotionType"
                        label="Promotion Type"
                        placeholder="Select promotion type"
                        options={PROMOTION_TYPE_CREATE_UPDATE}
                        disabled={isProcessing}
                        error={errors.promotionType}
                      />

                      {/* Only show promotion fields when type is not NONE */}
                      {showPromotionFields && (
                        <>
                          <TextField
                            control={control}
                            name="promotionValue"
                            label="Promotion Value"
                            type="number"
                            placeholder="Enter promotion value"
                            disabled={isProcessing}
                            error={errors.promotionValue as any}
                            valueAsNumber={true}
                            min={0}
                            step="0.01"
                            allowZero={false}
                          />

                          <div className="col-span-2 grid grid-cols-2 gap-4">
                            <DateTimePickerField
                              control={control}
                              name="promotionFromDate"
                              label="Promotion From"
                              mode="datetime"
                              placeholder="Select start date & time"
                              disabled={isProcessing}
                              error={errors.promotionFromDate}
                            />

                            <DateTimePickerField
                              control={control}
                              name="promotionToDate"
                              label="Promotion To"
                              mode="datetime"
                              placeholder="Select end date & time"
                              disabled={isProcessing}
                              error={errors.promotionToDate}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Product Images */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Product Images</h3>
                      <p className="text-sm text-muted-foreground">
                        {imageFields.length > 0
                          ? `${
                              imageFields.length
                            }/${MAX_PRODUCT_IMAGES} images uploaded${
                              !canAddMore ? " (Maximum reached)" : ""
                            }`
                          : `Upload up to ${MAX_PRODUCT_IMAGES} additional product images`}
                      </p>
                    </div>
                    {canAddMore && (
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="multiple-image-upload"
                          multiple
                          accept="image/*"
                          onChange={handleMultipleImageUpload}
                          className="hidden"
                          disabled={isProcessing}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById("multiple-image-upload")
                              ?.click()
                          }
                          disabled={isProcessing}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {isProcessingImages
                            ? "Processing..."
                            : `Upload Images (${remainingSlots} left)`}
                        </Button>
                      </div>
                    )}
                  </div>

                  {imageFields.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Plus className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            No additional images
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Upload up to {MAX_PRODUCT_IMAGES} product images at
                            once
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById("multiple-image-upload")
                              ?.click()
                          }
                          disabled={isProcessing}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Images
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {imageFields.map((field, index) => (
                          <Card key={field.id} className="overflow-hidden">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="relative group">
                                  <ClickableImageUpload
                                    label=""
                                    value={
                                      watch(`images.${index}.imageUrl`) || ""
                                    }
                                    onChange={(base64) =>
                                      setValue(
                                        `images.${index}.imageUrl`,
                                        base64,
                                        {
                                          shouldDirty: true,
                                        },
                                      )
                                    }
                                    aspectRatio="square"
                                    height="h-32"
                                    maxSize={5}
                                    disabled={isProcessing}
                                    error={
                                      errors.images?.[index]?.imageUrl as any
                                    }
                                    showPreviewText={false}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7 z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    onClick={() => removeImage(index)}
                                    disabled={isProcessing}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <p className="text-xs text-center text-muted-foreground">
                                  Image {index + 1}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {imageFields.length}/{MAX_PRODUCT_IMAGES} images
                          </p>
                          {canAddMore && (
                            <span className="text-xs text-muted-foreground">
                              • {remainingSlots} slot
                              {remainingSlots > 1 ? "s" : ""} remaining
                            </span>
                          )}
                          {!canAddMore && (
                            <span className="text-xs text-amber-600 font-medium">
                              • Maximum reached
                            </span>
                          )}
                        </div>
                        {canAddMore && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById("multiple-image-upload")
                                ?.click()
                            }
                            disabled={isProcessing}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add More
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Sizes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Product Sizes</h3>
                      <p className="text-sm text-muted-foreground">
                        {hasSizes
                          ? "Pricing will come from sizes. Main product pricing is disabled."
                          : "No sizes defined. Using main product pricing."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendSize({
                          name: "",
                          price: 0,
                          promotionType: "NONE",
                          promotionValue: undefined,
                          promotionFromDate: "",
                          promotionToDate: "",
                        })
                      }
                      disabled={isProcessing}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Size
                    </Button>
                  </div>

                  {sizeFields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        No sizes defined. Product will use main pricing.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sizeFields.map((field, index) => {
                        const sizePromotionType = watch(
                          `sizes.${index}.promotionType`,
                        );
                        const showSizePromotionFields =
                          sizePromotionType && sizePromotionType !== "NONE";

                        return (
                          <Card key={field.id}>
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  Size {index + 1}
                                </CardTitle>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeSize(index)}
                                  disabled={isProcessing}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4">
                                <TextField
                                  control={control}
                                  name={`sizes.${index}.name`}
                                  label="Size Name"
                                  placeholder="e.g., Small, Medium, Large"
                                  disabled={isProcessing}
                                  error={errors.sizes?.[index]?.name as any}
                                />

                                <TextField
                                  control={control}
                                  name={`sizes.${index}.price`}
                                  label="Price"
                                  type="number"
                                  placeholder="Enter price"
                                  disabled={isProcessing}
                                  error={errors.sizes?.[index]?.price as any}
                                  valueAsNumber={true}
                                  min={0}
                                  step="0.01"
                                  allowZero={true}
                                />

                                <SelectField
                                  control={control}
                                  name={`sizes.${index}.promotionType`}
                                  label="Promotion Type"
                                  placeholder="Select promotion type"
                                  options={PROMOTION_TYPE_CREATE_UPDATE}
                                  disabled={isProcessing}
                                  error={
                                    errors.sizes?.[index]?.promotionType as any
                                  }
                                />

                                {showSizePromotionFields && (
                                  <>
                                    <TextField
                                      control={control}
                                      name={`sizes.${index}.promotionValue`}
                                      label="Promotion Value"
                                      type="number"
                                      placeholder="Enter promotion value"
                                      disabled={isProcessing}
                                      error={
                                        errors.sizes?.[index]
                                          ?.promotionValue as any
                                      }
                                      valueAsNumber={true}
                                      min={0}
                                      step="0.01"
                                      allowZero={false}
                                    />

                                    <DateTimePickerField
                                      control={control}
                                      name={`sizes.${index}.promotionFromDate`}
                                      label="Promotion From"
                                      mode="datetime"
                                      placeholder="Select start date & time"
                                      disabled={isProcessing}
                                      error={
                                        errors.sizes?.[index]
                                          ?.promotionFromDate as any
                                      }
                                    />

                                    <DateTimePickerField
                                      control={control}
                                      name={`sizes.${index}.promotionToDate`}
                                      label="Promotion To"
                                      mode="datetime"
                                      placeholder="Select end date & time"
                                      disabled={isProcessing}
                                      error={
                                        errors.sizes?.[index]
                                          ?.promotionToDate as any
                                      }
                                    />
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isProcessing}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage={
                isUploadingImage ? "Uploading images..." : "Creating product..."
              }
              updateMessage={
                isUploadingImage ? "Uploading images..." : "Updating product..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Product"
                updateText="Update Product"
                submittingCreateText={
                  isUploadingImage ? "Uploading..." : "Creating..."
                }
                submittingUpdateText={
                  isUploadingImage ? "Uploading..." : "Updating..."
                }
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
