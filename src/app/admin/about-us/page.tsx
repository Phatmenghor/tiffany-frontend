"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { Loading } from "@/components/shared/common/loading";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectSelectedProduct,
  selectIsFetchingDetail,
  selectOperations,
  selectError,
} from "@/redux/features/setting/store/selectors/about-us-selector";
import {
  updateAboutUsSchema,
  AboutUsFormData,
} from "@/redux/features/setting/store/models/schema/about-us-schema";
import {
  fetchAboutUsService,
  updateAboutUsService,
} from "@/redux/features/setting/store/thunks/about-us-thunks";
import { clearError } from "@/redux/features/setting/store/slice/about-us-slice";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import { showToast } from "@/components/shared/common/show-toast";
import { CardHeaderSection } from "@/components/layout/card-header-section";

const AboutUsPage = () => {
  const dispatch = useAppDispatch();
  const selectedAboutUs = useAppSelector(selectSelectedProduct);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isUpdating } = operations;

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<AboutUsFormData>({
    resolver: zodResolver(updateAboutUsSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      mainImageUrl: "",
      contactInfo: "",
      showroomHours: "",
      phoneNumber: "",
      email: "",
      address: "",
      facebookUrl: "",
      instagramUrl: "",
      websiteUrl: "",
    },
    mode: "onChange",
  });

  const mainImageUrl = watch("mainImageUrl");

  // Fetch about-us data on mount
  useEffect(() => {
    dispatch(fetchAboutUsService(""));
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Populate form when data is fetched
  useEffect(() => {
    if (selectedAboutUs) {
      reset({
        title: selectedAboutUs.title || "",
        description: selectedAboutUs.description || "",
        mainImageUrl: selectedAboutUs.mainImageUrl || "",
        contactInfo: selectedAboutUs.contactInfo || "",
        showroomHours: selectedAboutUs.showroomHours || "",
        phoneNumber: selectedAboutUs.phoneNumber || "",
        email: selectedAboutUs.email || "",
        address: selectedAboutUs.address || "",
        facebookUrl: selectedAboutUs.facebookUrl || "",
        instagramUrl: selectedAboutUs.instagramUrl || "",
        websiteUrl: selectedAboutUs.websiteUrl || "",
      });
    }
  }, [selectedAboutUs, reset]);

  const onSubmit = async (data: AboutUsFormData) => {
    try {
      let finalImageUrl = data.mainImageUrl;

      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          showToast.error("Failed to upload image. Please try again.");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload = {
        title: data.title,
        description: data.description,
        mainImageUrl: finalImageUrl,
        contactInfo: data.contactInfo || "",
        showroomHours: data.showroomHours || "",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        address: data.address || "",
        facebookUrl: data.facebookUrl || "",
        instagramUrl: data.instagramUrl || "",
        websiteUrl: data.websiteUrl || "",
      };

      await dispatch(updateAboutUsService(payload as any)).unwrap();
      showToast.success("About Us updated successfully");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update About Us");
    }
  };

  const isProcessing = isUpdating || isUploadingImage;

  if (isFetchingDetail) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-2">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: "/admin" },
            { label: "About Us" },
          ]}
          title="About Us"
        />
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <Loading />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <CardHeaderSection
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "About Us" },
        ]}
        title="About Us"
      />

      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {reduxError && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            {/* Main Image - Square aspect ratio (equal width and height) */}
            <div className="max-w-sm">
              <ClickableImageUpload
                label="Main Image"
                value={mainImageUrl}
                onChange={(base64) =>
                  setValue("mainImageUrl", base64, { shouldDirty: true })
                }
                aspectRatio="square"
                required
                error={errors.mainImageUrl}
                placeholder="Click to upload main image"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  control={control}
                  name="title"
                  label="Title"
                  placeholder="Enter title"
                  required
                  disabled={isProcessing}
                  error={errors.title}
                />
                <TextField
                  control={control}
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                  disabled={isProcessing}
                  error={errors.email}
                />
              </div>

              <div className="mt-4">
                <TextareaField
                  control={control}
                  name="description"
                  label="Description"
                  placeholder="Enter description"
                  required
                  rows={4}
                  disabled={isProcessing}
                  error={errors.description}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  control={control}
                  name="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter phone number"
                  disabled={isProcessing}
                  error={errors.phoneNumber}
                />
                <TextField
                  control={control}
                  name="address"
                  label="Address"
                  placeholder="Enter address"
                  disabled={isProcessing}
                  error={errors.address}
                />
                <TextField
                  control={control}
                  name="contactInfo"
                  label="Contact Info"
                  placeholder="Enter contact info"
                  disabled={isProcessing}
                  error={errors.contactInfo}
                />
                <TextField
                  control={control}
                  name="showroomHours"
                  label="Showroom Hours"
                  placeholder="Enter showroom hours"
                  disabled={isProcessing}
                  error={errors.showroomHours}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  control={control}
                  name="facebookUrl"
                  label="Facebook URL"
                  type="url"
                  placeholder="https://facebook.com/..."
                  disabled={isProcessing}
                  error={errors.facebookUrl}
                />
                <TextField
                  control={control}
                  name="instagramUrl"
                  label="Instagram URL"
                  type="url"
                  placeholder="https://instagram.com/..."
                  disabled={isProcessing}
                  error={errors.instagramUrl}
                />
                <TextField
                  control={control}
                  name="websiteUrl"
                  label="Website URL"
                  type="url"
                  placeholder="https://example.com"
                  disabled={isProcessing}
                  error={errors.websiteUrl}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end border-t pt-6">
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={false}
                updateText="Save Changes"
                submittingUpdateText={
                  isUploadingImage ? "Uploading..." : "Saving..."
                }
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutUsPage;
