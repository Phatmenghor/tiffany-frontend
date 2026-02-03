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
  PAYMENT_CREATE_UPDATE,
  STATUS_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { Loading } from "@/components/shared/common/loading";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/payment-selector";
import {
  createPaymentSchema,
  PaymentFormData,
  updatePaymentSchema,
} from "../store/models/schema/payment-schema";
import {
  createPaymentService,
  fetchPaymentByIdService,
  updatePaymentService,
} from "../store/thunks/payment-thunks";
import { clearError, clearSelectedPayment } from "../store/slice/payment-slice";
import {
  CreatePaymentData,
  UpdatePaymentData,
} from "../store/models/request/paymemt-request";
import { TextareaField } from "@/components/shared/form-field/text-area-field";

type Props = {
  mode: ModalMode;
  paymentId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function PaymentModal({
  isOpen,
  onClose,
  paymentId,
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
  } = useForm<PaymentFormData>({
    resolver: zodResolver(
      isCreate ? createPaymentSchema : updatePaymentSchema,
    ) as any,
    defaultValues: {
      name: "",
      type: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      qrCodeImageUrl: "",
      description: "",
      isActive: true,
      sortOrder: 0,
    },
    mode: "onChange",
  });

  const imageUrl = watch("qrCodeImageUrl");

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        type: "",
        bankName: "",
        accountName: "",
        accountNumber: "",
        qrCodeImageUrl: "",
        description: "",
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [isOpen, paymentId, reset]);

  // Fetch banner data for edit mode
  useEffect(() => {
    const fetchBrandData = async () => {
      if (!paymentId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchPaymentByIdService(paymentId));

        if (fetchPaymentByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            name: data?.name || "",
            type: data?.type || "",
            bankName: data?.bankName || "",
            accountName: data?.accountName || "",
            accountNumber: data?.accountNumber || "",
            qrCodeImageUrl: data?.qrCodeImageUrl || "",
            description: data?.description || "",
            isActive: data?.isActive ?? true,
            sortOrder: data?.sortOrder ?? 0,
          });
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
    };

    fetchBrandData();
  }, [paymentId, isOpen, isCreate, reset, dispatch]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      let finalImageUrl = data.qrCodeImageUrl;

      // Upload image if it's a base64 string with loading state
      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (uploadError) {
          console.error("Error uploading payment image:", uploadError);
          showToast.error("Failed to upload payment image. Please try again.");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      if (isCreate) {
        const payload: CreatePaymentData = {
          name: data?.name || "",
          qrCodeImageUrl: finalImageUrl || "",
          isActive: data.isActive,
          sortOrder: data.sortOrder ?? 0,
          type: data.type,
          bankName: data.bankName || "",
          accountName: data.accountName || "",
          accountNumber: data.accountNumber || "",
          description: data.description || "",
        };
        await dispatch(createPaymentService(payload)).unwrap();
        showToast.success("Payment created successfully");
        handleClose();
      } else {
        const payload: UpdatePaymentData = {
          name: data?.name || "",
          qrCodeImageUrl: finalImageUrl || "",
          isActive: data.isActive,
          sortOrder: data.sortOrder ?? 0,
          type: data.type,
          bankName: data.bankName || "",
          accountName: data.accountName || "",
          accountNumber: data.accountNumber || "",
          description: data.description || "",
        };
        await dispatch(
          updatePaymentService({
            paymentId: paymentId!,
            paymentData: payload,
          }),
        ).unwrap();
        showToast.success("Payment updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message || `Failed to ${isCreate ? "create" : "update"} payment`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedPayment());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Payment" : "Edit Payment"}
          description={
            isCreate
              ? "Upload an image and configure payment settings"
              : "Update payment information below"
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
                    label="Payment Image"
                    value={imageUrl}
                    onChange={(base64) => setValue("qrCodeImageUrl", base64)}
                    aspectRatio="square"
                    required
                    error={errors.qrCodeImageUrl}
                    placeholder="Click to upload payment image"
                    helperText="Square image works best (500x500)"
                  />
                </div>

                {/* Divider */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Payment Details
                  </h3>

                  {/* Banner Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="name"
                      label="Name Payment"
                      placeholder="Enter name payment"
                      disabled={isProcessing}
                      error={errors.name}
                    />

                    <SelectField
                      control={control}
                      name="type"
                      label="Payment Type"
                      placeholder="Select payment type"
                      options={PAYMENT_CREATE_UPDATE}
                      required
                      disabled={isProcessing}
                      error={errors.type}
                    />

                    <TextField
                      control={control}
                      name="bankName"
                      label="Bank Name"
                      placeholder="Enter bank name"
                      disabled={isProcessing}
                      error={errors.bankName}
                    />

                    <TextField
                      control={control}
                      name="accountName"
                      label="Account Name"
                      placeholder="Enter account name"
                      disabled={isProcessing}
                      error={errors.accountName}
                    />

                    <TextField
                      control={control}
                      name="accountNumber"
                      label="Account Number"
                      placeholder="Enter account number"
                      disabled={isProcessing}
                      error={errors.accountNumber}
                    />

                    <TextField
                      control={control}
                      name="sortOrder"
                      label="Sort Order"
                      type="number"
                      placeholder="Enter sort order (number)"
                      disabled={isProcessing}
                      error={errors.sortOrder}
                    />

                    <SelectField
                      control={control}
                      name="status"
                      label="Status"
                      placeholder="Select status"
                      options={STATUS_CREATE_UPDATE}
                      required
                      disabled={isProcessing}
                      error={errors.isActive}
                    />

                    <TextareaField
                      control={control}
                      name="description"
                      label="Description"
                      placeholder="Enter product description"
                      rows={4}
                      disabled={isProcessing}
                      error={errors.description}
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
                isProcessing ? "Uploading payment..." : "Creating payment..."
              }
              updateMessage={
                isProcessing ? "Uploading payment..." : "Updating payment..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Payment"
                updateText="Update Payment"
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
