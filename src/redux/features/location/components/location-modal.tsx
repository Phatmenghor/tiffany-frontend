"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CheckboxField } from "@/components/shared/form-field/checkbox-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { Button } from "@/components/ui/button";
import {
  createLocationService,
  updateLocationService,
} from "../store/thunks/location-thunks";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { clearLocationError } from "../store/slice/location-slice";
import {
  selectLocationError,
  selectLocationOperations,
} from "../store/selectors/location-selector";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import {
  createLocationSchema,
  LocationFormData,
} from "../store/models/schema/location-schema";
import { LocationResponseModel } from "../store/models/response/location-response";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editData?: LocationResponseModel | null;
};

export default function LocationModal({ isOpen, onClose, editData }: Props) {
  const isCreate = !editData;
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectLocationOperations);
  const reduxError = useAppSelector(selectLocationError);
  const { isCreating, isUpdating } = operations;

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<LocationFormData>({
    resolver: zodResolver(createLocationSchema) as any,
    defaultValues: {
      label: "",
      latitude: 0,
      longitude: 0,
      houseNumber: "",
      streetNumber: "",
      village: "",
      commune: "",
      district: "",
      province: "",
      country: "",
      note: "",
      isPrimary: false,
    },
    mode: "onChange",
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Reverse geocode from coordinates and fill form fields
  const reverseGeocodeAndFill = useCallback(
    async (lat: number, lng: number) => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return;

      setIsReverseGeocoding(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
        );
        const data = await response.json();

        if (data.status === "OK" && data.results && data.results.length > 0) {
          const result = data.results[0];
          const components = result.address_components || [];

          let streetNumber = "";
          let village = "";
          let commune = "";
          let district = "";
          let province = "";
          let country = "";

          components.forEach(
            (comp: { types: string[]; long_name: string }) => {
              if (comp.types.includes("street_number")) {
                streetNumber = comp.long_name;
              } else if (comp.types.includes("route")) {
                streetNumber = streetNumber
                  ? `${streetNumber} ${comp.long_name}`
                  : comp.long_name;
              } else if (
                comp.types.includes("sublocality_level_1") ||
                comp.types.includes("sublocality")
              ) {
                village = comp.long_name;
              } else if (comp.types.includes("locality")) {
                commune = comp.long_name;
              } else if (
                comp.types.includes("administrative_area_level_2")
              ) {
                district = comp.long_name;
              } else if (
                comp.types.includes("administrative_area_level_1")
              ) {
                province = comp.long_name;
              } else if (comp.types.includes("country")) {
                country = comp.long_name;
              }
            },
          );

          setValue("streetNumber", streetNumber, { shouldDirty: true });
          setValue("village", village, { shouldDirty: true });
          setValue("commune", commune, { shouldDirty: true });
          setValue("district", district, { shouldDirty: true });
          setValue("province", province, { shouldDirty: true });
          setValue("country", country, { shouldDirty: true });
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [setValue],
  );

  // Update marker position on map
  const updateMarkerPosition = useCallback(
    (lat: number, lng: number) => {
      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng });
      }
      if (googleMapRef.current) {
        googleMapRef.current.panTo({ lat, lng });
      }
      setValue("latitude", lat, { shouldDirty: true });
      setValue("longitude", lng, { shouldDirty: true });
    },
    [setValue],
  );

  // Load Google Maps script
  useEffect(() => {
    if (!isOpen) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not found");
      return;
    }

    const loadGoogleMaps = () => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]',
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => setIsMapLoaded(true));
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [isOpen]);

  // Initialize map when loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !isOpen) return;

    const defaultLat = editData?.latitude || 11.5564;
    const defaultLng = editData?.longitude || 104.9282;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: defaultLat, lng: defaultLng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const marker = new google.maps.Marker({
      position: { lat: defaultLat, lng: defaultLng },
      map,
      draggable: true,
      title: "Location",
    });

    googleMapRef.current = map;
    markerRef.current = marker;

    // Handle marker drag end
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (pos) {
        const lat = pos.lat();
        const lng = pos.lng();
        setValue("latitude", lat, { shouldDirty: true });
        setValue("longitude", lng, { shouldDirty: true });
        reverseGeocodeAndFill(lat, lng);
      }
    });

    // Handle map click
    map.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateMarkerPosition(lat, lng);
        reverseGeocodeAndFill(lat, lng);
      }
    });

    // Setup Places Autocomplete for search
    if (searchInputRef.current && window.google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          types: ["geocode", "establishment"],
        },
      );

      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          map.setCenter(place.geometry.location);
          map.setZoom(17);
          updateMarkerPosition(lat, lng);
          reverseGeocodeAndFill(lat, lng);
        }
      });
    }

    return () => {
      googleMapRef.current = null;
      markerRef.current = null;
    };
  }, [
    isMapLoaded,
    isOpen,
    editData,
    setValue,
    reverseGeocodeAndFill,
    updateMarkerPosition,
  ]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        label: "",
        latitude: 0,
        longitude: 0,
        houseNumber: "",
        streetNumber: "",
        village: "",
        commune: "",
        district: "",
        province: "",
        country: "",
        note: "",
        isPrimary: false,
      });
    } else if (isOpen && editData) {
      reset({
        label: editData.label || "",
        latitude: editData.latitude || 0,
        longitude: editData.longitude || 0,
        houseNumber: editData.houseNumber || "",
        streetNumber: editData.streetNumber || "",
        village: editData.village || "",
        commune: editData.commune || "",
        district: editData.district || "",
        province: editData.province || "",
        country: editData.country || "",
        note: editData.note || "",
        isPrimary: editData.isPrimary || false,
      });
    }
  }, [isOpen, isCreate, editData, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearLocationError());
    }
  }, [isOpen, dispatch]);

  // Use current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateMarkerPosition(lat, lng);
        reverseGeocodeAndFill(lat, lng);
        if (googleMapRef.current) {
          googleMapRef.current.setZoom(17);
        }
      },
      (error) => {
        showToast.error("Unable to retrieve your location");
        console.error("Geolocation error:", error);
      },
    );
  };

  const onSubmit = async (data: LocationFormData) => {
    try {
      const payload = {
        label: data.label,
        latitude: data.latitude,
        longitude: data.longitude,
        houseNumber: data.houseNumber || "",
        streetNumber: data.streetNumber || "",
        village: data.village || "",
        commune: data.commune || "",
        district: data.district || "",
        province: data.province || "",
        country: data.country || "",
        note: data.note || "",
        isPrimary: data.isPrimary,
      };

      if (isCreate) {
        await dispatch(createLocationService(payload)).unwrap();
        showToast.success("Location created successfully");
      } else {
        await dispatch(
          updateLocationService({
            locationId: editData!.id,
            locationData: payload,
          }),
        ).unwrap();
        showToast.success("Location updated successfully");
      }
      handleClose();
    } catch (error: any) {
      showToast.error(
        error?.message ||
          `Failed to ${isCreate ? "create" : "update"} location`,
      );
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearLocationError());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95%] max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Add New Location" : "Edit Location"}
          description={
            isCreate
              ? "Select a location on the map or enter the address manually"
              : "Update your location information"
          }
          isCreate={isCreate}
        />

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
              {/* Map Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Select Location on Map
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Use Current Location
                  </Button>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for a place..."
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>

                {/* Map Container */}
                <div className="relative rounded-lg overflow-hidden border">
                  <div
                    ref={mapRef}
                    className="w-full h-[300px] bg-muted"
                  />
                  {!isMapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Loading map...
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Coordinates Display */}
                {latitude !== 0 && longitude !== 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                    <MapPin className="h-3 w-3" />
                    <span>
                      Lat: {latitude?.toFixed(6)}, Lng:{" "}
                      {longitude?.toFixed(6)}
                    </span>
                    {isReverseGeocoding && (
                      <Loader2 className="h-3 w-3 animate-spin ml-2" />
                    )}
                  </div>
                )}
              </div>

              {/* Label */}
              <TextField
                control={control}
                name="label"
                label="Label"
                placeholder="e.g., Home, Office, Shop"
                required
                disabled={isSubmitting}
                error={errors.label}
              />

              {/* Address Fields */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Address Details</h3>
                <p className="text-xs text-muted-foreground">
                  Fields are auto-filled from the map. You can edit them
                  manually if needed.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    control={control}
                    name="houseNumber"
                    label="House Number"
                    placeholder="Enter house number"
                    disabled={isSubmitting}
                    error={errors.houseNumber}
                  />

                  <TextField
                    control={control}
                    name="streetNumber"
                    label="Street"
                    placeholder="Enter street"
                    disabled={isSubmitting}
                    error={errors.streetNumber}
                  />

                  <TextField
                    control={control}
                    name="village"
                    label="Village / Sangkat"
                    placeholder="Enter village"
                    disabled={isSubmitting}
                    error={errors.village}
                  />

                  <TextField
                    control={control}
                    name="commune"
                    label="Commune / City"
                    placeholder="Enter commune"
                    disabled={isSubmitting}
                    error={errors.commune}
                  />

                  <TextField
                    control={control}
                    name="district"
                    label="District / Khan"
                    placeholder="Enter district"
                    disabled={isSubmitting}
                    error={errors.district}
                  />

                  <TextField
                    control={control}
                    name="province"
                    label="Province"
                    placeholder="Enter province"
                    disabled={isSubmitting}
                    error={errors.province}
                  />

                  <TextField
                    control={control}
                    name="country"
                    label="Country"
                    placeholder="Enter country"
                    disabled={isSubmitting}
                    error={errors.country}
                  />
                </div>
              </div>

              {/* Note */}
              <TextareaField
                control={control}
                name="note"
                label="Note"
                placeholder="Additional delivery instructions or notes"
                rows={3}
                disabled={isSubmitting}
                error={errors.note}
              />

              {/* Primary checkbox */}
              <CheckboxField
                control={control}
                name="isPrimary"
                label="Set as primary location"
                disabled={isSubmitting}
                error={errors.isPrimary}
              />
            </div>
          </FormBody>

          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage="Creating location..."
            updateMessage="Updating location..."
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Add Location"
              updateText="Update Location"
              submittingCreateText="Creating..."
              submittingUpdateText="Updating..."
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
