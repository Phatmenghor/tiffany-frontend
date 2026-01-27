"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, Status } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import { showToast } from "@/components/shared/common/show-toast";
import { BANNER_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/categories-selector";
import {
  CreateCategoriesData,
  createCategoriesSchema,
  updateCategoriesSchema,
} from "../store/models/schema/categories-schema";
import {
  createCategoriesService,
  fetchCategoriesByIdService,
  updateCategoriesService,
} from "../store/thunks/categories-thunks";
import {
  clearError,
  clearSelectedCategories,
} from "../store/slice/categories-slice";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  categoriesId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function CategoriesModal({
  isOpen,
  onClose,
  categoriesId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  // Local state for image upload loading
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateCategoriesData>({
    resolver: zodResolver(
      isCreate ? createCategoriesSchema : updateCategoriesSchema,
    ),
    defaultValues: {
      name: "",
      imageUrl: "",
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        imageUrl: "",
        status: Status.ACTIVE,
      });
    }
  }, [isOpen, categoriesId, reset]);

  // Fetch banner data for edit mode
  useEffect(() => {
    const fetchBrandData = async () => {
      if (!categoriesId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchCategoriesByIdService(categoriesId),
        );

        if (fetchCategoriesByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            name: data?.name || "",
            imageUrl: data?.imageUrl || "",
            status: data?.status || "",
          });
        }
      } catch (error) {
        console.error("Error fetching categories data:", error);
      }
    };

    fetchBrandData();
  }, [categoriesId, isOpen, isCreate, reset, dispatch]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateCategoriesData) => {
    try {
      let finalImageUrl = data.imageUrl;

      // Upload image if it's a base64 string with loading state
      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (uploadError) {
          console.error("Error uploading categories image:", uploadError);
          showToast.error(
            "Failed to upload categories image. Please try again.",
          );
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload: CreateCategoriesData = {
        name: data?.name || "",
        imageUrl: finalImageUrl,
        status: data.status,
      };

      if (isCreate) {
        await dispatch(createCategoriesService(payload)).unwrap();
        showToast.success("Categories created successfully");
        handleClose();
      } else {
        await dispatch(
          updateCategoriesService({
            categoriesId: categoriesId!,
            categoriesData: payload,
          }),
        ).unwrap();
        showToast.success("Categories updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message ||
          `Failed to ${isCreate ? "create" : "update"} categories`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedCategories());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Categories" : "Edit Categories"}
          description={
            isCreate
              ? "Upload an image and configure categories settings"
              : "Update categories information below"
          }
          isCreate={isCreate}
        />

        {/* Show loading spinner in edit mode while fetching or when form is empty */}
        {!isCreate && (isFetchingDetail || !imageUrl) ? (
          <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {/* Display Redux errors */}
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Categories Image Section - Prominent display */}
                <div className="space-y-3">
                  <ClickableImageUpload
                    label="Category Image"
                    value={imageUrl}
                    onChange={(base64) => setValue("imageUrl", base64)}
                    aspectRatio="square"
                    required
                    error={errors.imageUrl}
                    placeholder="Click to upload category image"
                    helperText="Square image works best (500x500)"
                  />
                </div>

                {/* Divider */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Banner Details
                  </h3>

                  {/* Banner Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="name"
                      label="Name Brand"
                      placeholder="Enter name brand"
                      disabled={isProcessing}
                      error={errors.name}
                    />

                    <SelectField
                      control={control}
                      name="status"
                      label="Status"
                      placeholder="Select status"
                      options={BANNER_STATUS_CREATE_UPDATE}
                      required
                      disabled={isProcessing}
                      error={errors.status}
                    />
                  </div>
                </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isProcessing}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage={
                isProcessing
                  ? "Uploading categories..."
                  : "Creating categories..."
              }
              updateMessage={
                isProcessing
                  ? "Uploading categories..."
                  : "Updating categories..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Brand"
                updateText="Update Brand"
                submittingCreateText={
                  isProcessing ? "Uploading..." : "Creating..."
                }
                submittingUpdateText={
                  isProcessing ? "Uploading..." : "Updating..."
                }
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
