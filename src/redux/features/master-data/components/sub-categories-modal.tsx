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
import {
  BANNER_STATUS_CREATE_UPDATE,
  STATUS_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import {
  clearError,
  clearSelectedCategories,
} from "../store/slice/categories-slice";
import { Loading } from "@/components/shared/common/loading";
import {
  createSubCategoriesService,
  fetchSubCategoriesByIdService,
  updateSubCategoriesService,
} from "../store/thunks/sub-categories-thunks";
import { CreateSubCategoriesData } from "../store/models/request/sub-categories-request";
import {
  createSubCategoriesSchema,
  SubCategoriesFormData,
  updateSubCategoriesSchema,
} from "../store/models/schema/sub-categories-schema";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/sub-categories-selector";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "../store/models/response/categories-response";

type Props = {
  mode: ModalMode;
  subCategoriesId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function SubCategoriesModal({
  isOpen,
  onClose,
  subCategoriesId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  // Local state for image upload loading
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoriesResponseModel | null>(null);

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
  } = useForm<SubCategoriesFormData>({
    resolver: zodResolver(
      isCreate ? createSubCategoriesSchema : updateSubCategoriesSchema,
    ) as any,
    defaultValues: {
      name: "",
      imageUrl: "",
      categoriesId: "",
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
        categoriesId: "",
        status: Status.ACTIVE,
      });
    }
  }, [isOpen, subCategoriesId, reset]);

  // Fetch sub-categories data for edit mode
  useEffect(() => {
    const fetchSubCategoriesData = async () => {
      if (!subCategoriesId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchSubCategoriesByIdService(subCategoriesId),
        );

        if (fetchSubCategoriesByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            name: data?.name || "",
            imageUrl: data?.imageUrl || "",
            categoriesId: data?.categoriesId || "",
            status: data?.status || "",
          });
        }
      } catch (error) {
        console.error("Error fetching sub-categories data:", error);
      }
    };

    fetchSubCategoriesData();
  }, [subCategoriesId, isOpen, isCreate, reset, dispatch]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: SubCategoriesFormData) => {
    try {
      let finalImageUrl = data.imageUrl;

      // Upload image if it's a base64 string with loading state
      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (uploadError) {
          console.error("Error uploading sub-categories image:", uploadError);
          showToast.error(
            "Failed to upload sub-categories image. Please try again.",
          );
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      if (isCreate) {
        const payload: CreateSubCategoriesData = {
          name: data?.name || "",
          imageUrl: finalImageUrl || "",
          categoriesId: data.categoriesId || "",
          status: data.status,
        };
        await dispatch(createSubCategoriesService(payload)).unwrap();
        showToast.success("Sub Categories created successfully");
        handleClose();
      } else {
        const payload: CreateSubCategoriesData = {
          name: data?.name || "",
          imageUrl: finalImageUrl || "",
          categoriesId: data.categoriesId || "",
          status: data.status,
        };
        await dispatch(
          updateSubCategoriesService({
            subCategoriesId: subCategoriesId!,
            subCategoriesData: payload,
          }),
        ).unwrap();
        showToast.success("Sub Categories updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message ||
          `Failed to ${isCreate ? "create" : "update"} Sub categories`,
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
          title={isCreate ? "Create New Sub Categories" : "Edit Sub Categories"}
          description={
            isCreate
              ? "Upload an image and configure sub-categories settings"
              : "Update sub-categories information below"
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
                    label="Sub-Categories Image"
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
                      label="Name Sub Categories"
                      placeholder="Enter name sub categories"
                      disabled={isProcessing}
                      error={errors.name}
                    />

                    <ComboboxSelectCategories
                      dataSelect={selectedCategory}
                      onChangeSelected={(category) => {
                        setSelectedCategory(category);
                        setValue("categoriesId", category?.id || "", {
                          shouldDirty: true,
                        });
                      }}
                      label="Categories"
                      placeholder="Select categories"
                      required
                      disabled={isProcessing}
                      error={errors.categoriesId?.message}
                      showAllOption={false}
                    />

                    <SelectField
                      control={control}
                      name="status"
                      label="Status"
                      placeholder="Select status"
                      options={STATUS_CREATE_UPDATE}
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
                  ? "Uploading sub categories..."
                  : "Creating sub categories..."
              }
              updateMessage={
                isProcessing
                  ? "Uploading sub categories..."
                  : "Updating sub categories..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Sub Categories"
                updateText="Update Sub Categories"
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
