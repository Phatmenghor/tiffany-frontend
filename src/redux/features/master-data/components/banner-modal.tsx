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
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/banner-selector";
import {
  BannerFormData,
  createBannerSchema,
  updateBannerSchema,
} from "../store/models/schema/banner-schema";
import {
  fetchBannerByIdService,
  createBannerService,
  updateBannerService,
} from "../store/thunks/banner-thunks";
import { clearError, clearSelectedBanner } from "../store/slice/banner-slice";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import { showToast } from "@/components/shared/common/show-toast";
import { BANNER_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import {
  CreateBannerRequest,
  UpdateBannerRequest,
} from "../store/models/request/banner-request";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  bannerId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function BannerModal({
  isOpen,
  onClose,
  bannerId,
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
  } = useForm<BannerFormData>({
    resolver: zodResolver(
      isCreate ? createBannerSchema : updateBannerSchema,
    ) as any,
    defaultValues: {
      imageUrl: "",
      linkUrl: "",
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      reset({
        imageUrl: "",
        linkUrl: "",
        status: Status.ACTIVE,
      });
    }
  }, [isOpen, bannerId, reset]);

  // Fetch banner data for edit mode
  useEffect(() => {
    const fetchBannerData = async () => {
      if (!bannerId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchBannerByIdService(bannerId));

        if (fetchBannerByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            imageUrl: data?.imageUrl || "",
            linkUrl: data?.linkUrl || "",
            status: data?.status || "",
          });
        }
      } catch (error) {
        console.error("Error fetching banner data:", error);
      }
    };

    fetchBannerData();
  }, [bannerId, isOpen, isCreate, reset, dispatch]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: BannerFormData) => {
    try {
      let finalImageUrl = data.imageUrl;

      // Upload image if it's a base64 string with loading state
      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (uploadError) {
          console.error("Error uploading banner image:", uploadError);
          showToast.error("Failed to upload banner image. Please try again.");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      if (isCreate) {
        const payload: CreateBannerRequest = {
          imageUrl: finalImageUrl,
          linkUrl: data.linkUrl || "",
          status: data.status,
        };

        await dispatch(createBannerService(payload)).unwrap();
        showToast.success("Banner created successfully");
        handleClose();
      } else {
        const payload: UpdateBannerRequest = {
          imageUrl: finalImageUrl,
          linkUrl: data.linkUrl || "",
          status: data.status,
        };
        await dispatch(
          updateBannerService({ id: bannerId!, payload }),
        ).unwrap();
        showToast.success("Banner updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message || `Failed to ${isCreate ? "create" : "update"} banner`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedBanner());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Banner" : "Edit Banner"}
          description={
            isCreate
              ? "Upload an image and configure banner settings"
              : "Update banner information below"
          }
          isCreate={isCreate}
        />

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
                <div className="space-y-3">
                  <ClickableImageUpload
                    label="Banner Image"
                    value={imageUrl}
                    onChange={(base64) => setValue("imageUrl", base64)}
                    aspectRatio="banner"
                    required
                    error={errors.imageUrl}
                    placeholder="Click to upload banner image"
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
                      name="linkUrl"
                      label="Link URL"
                      type="url"
                      placeholder="https://example.com (optional)"
                      disabled={isProcessing}
                      error={errors.linkUrl}
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
                isProcessing ? "Uploading banner..." : "Creating banner..."
              }
              updateMessage={
                isProcessing ? "Uploading banner..." : "Updating banner..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Banner"
                updateText="Update Banner"
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
