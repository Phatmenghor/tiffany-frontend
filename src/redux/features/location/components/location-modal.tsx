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
import {
  MapPin,
  Search,
  Loader2,
  Maximize2,
  Minimize2,
  LocateFixed,
} from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editData?: LocationResponseModel | null;
  initialCoords?: { lat: number; lng: number } | null;
};

// Helper: load Google Maps script once
function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      if (window.google?.maps) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Google Maps")),
        );
      }
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("Google Maps API key not configured"));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export default function LocationModal({
  isOpen,
  onClose,
  editData,
  initialCoords,
}: Props) {
  const isCreate = !editData;
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectLocationOperations);
  const reduxError = useAppSelector(selectLocationError);
  const { isCreating, isUpdating } = operations;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const idleListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  // ------------------------------------------------------------------
  // Reverse geocode: fetch address components from lat/lng
  // ------------------------------------------------------------------
  const reverseGeocodeAndFill = useCallback(
    async (lat: number, lng: number) => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return;

      setIsReverseGeocoding(true);
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en`,
        );
        const data = await res.json();

        if (data.status === "OK" && data.results?.length > 0) {
          const components = data.results[0].address_components || [];

          let streetNumber = "";
          let village = "";
          let commune = "";
          let district = "";
          let province = "";
          let country = "";

          for (const comp of components) {
            const types: string[] = comp.types;
            if (types.includes("street_number")) {
              streetNumber = comp.long_name;
            } else if (types.includes("route")) {
              streetNumber = streetNumber
                ? `${streetNumber} ${comp.long_name}`
                : comp.long_name;
            } else if (
              types.includes("sublocality_level_1") ||
              types.includes("sublocality")
            ) {
              village = comp.long_name;
            } else if (types.includes("locality")) {
              commune = comp.long_name;
            } else if (types.includes("administrative_area_level_2")) {
              district = comp.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              province = comp.long_name;
            } else if (types.includes("country")) {
              country = comp.long_name;
            }
          }

          setValue("streetNumber", streetNumber, { shouldDirty: true });
          setValue("village", village, { shouldDirty: true });
          setValue("commune", commune, { shouldDirty: true });
          setValue("district", district, { shouldDirty: true });
          setValue("province", province, { shouldDirty: true });
          setValue("country", country, { shouldDirty: true });
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [setValue],
  );

  // ------------------------------------------------------------------
  // Called whenever the map stops moving – reads center, updates form
  // ------------------------------------------------------------------
  const handleMapIdle = useCallback(() => {
    const map = googleMapRef.current;
    if (!map) return;
    const center = map.getCenter();
    if (!center) return;

    const lat = center.lat();
    const lng = center.lng();

    setValue("latitude", lat, { shouldDirty: true });
    setValue("longitude", lng, { shouldDirty: true });
    setIsDragging(false);

    // Debounce reverse geocoding so we don't flood the API
    if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    geocodeTimeoutRef.current = setTimeout(() => {
      reverseGeocodeAndFill(lat, lng);
    }, 400);
  }, [setValue, reverseGeocodeAndFill]);

  // ------------------------------------------------------------------
  // Initialize / reinitialize the Google Map
  // ------------------------------------------------------------------
  const initMap = useCallback(
    (container: HTMLDivElement, lat: number, lng: number) => {
      // Clean up previous
      if (idleListenerRef.current) {
        google.maps.event.removeListener(idleListenerRef.current);
        idleListenerRef.current = null;
      }

      const map = new google.maps.Map(container, {
        center: { lat, lng },
        zoom: 17,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: "greedy",
      });

      googleMapRef.current = map;

      // Track drag state for pin animation
      map.addListener("dragstart", () => setIsDragging(true));
      map.addListener("dragend", () => setIsDragging(false));

      // On idle (pan/zoom ends) – update coords + reverse geocode
      idleListenerRef.current = map.addListener("idle", handleMapIdle);

      // Set initial coords in form
      setValue("latitude", lat, { shouldDirty: true });
      setValue("longitude", lng, { shouldDirty: true });
      reverseGeocodeAndFill(lat, lng);

      // Search autocomplete
      if (searchInputRef.current && google.maps.places) {
        const autocomplete = new google.maps.places.Autocomplete(
          searchInputRef.current,
          { types: ["geocode", "establishment"] },
        );
        autocomplete.bindTo("bounds", map);
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
          }
        });
      }
    },
    [handleMapIdle, setValue, reverseGeocodeAndFill],
  );

  // ------------------------------------------------------------------
  // Load script + init map when modal opens
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) {
      setIsMapReady(false);
      setIsFullScreen(false);
      return;
    }

    let cancelled = false;

    const setup = async () => {
      try {
        await loadGoogleMapsScript();
        if (cancelled) return;
        setIsMapReady(true);
      } catch (err) {
        console.error("Google Maps load error:", err);
      }
    };

    setup();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // When map is ready and container is mounted, init map
  useEffect(() => {
    if (!isMapReady || !mapContainerRef.current) return;

    let lat: number;
    let lng: number;

    if (editData) {
      lat = editData.latitude || 11.5564;
      lng = editData.longitude || 104.9282;
    } else if (initialCoords) {
      lat = initialCoords.lat;
      lng = initialCoords.lng;
    } else {
      lat = 11.5564;
      lng = 104.9282;
    }

    initMap(mapContainerRef.current, lat, lng);

    return () => {
      if (idleListenerRef.current) {
        google.maps.event.removeListener(idleListenerRef.current);
        idleListenerRef.current = null;
      }
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
      googleMapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady]);

  // ------------------------------------------------------------------
  // Reset form when modal opens
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
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
    } else {
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
    }
    dispatch(clearLocationError());
  }, [isOpen, editData, reset, dispatch]);

  // ------------------------------------------------------------------
  // My location button
  // ------------------------------------------------------------------
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      showToast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = googleMapRef.current;
        if (map) {
          map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          map.setZoom(17);
        }
      },
      () => {
        showToast.error("Unable to retrieve your location");
      },
    );
  };

  // ------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------
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
    setIsFullScreen(false);
    reset();
    dispatch(clearLocationError());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`p-0 flex flex-col transition-all duration-300 ${
          isFullScreen
            ? "w-screen max-w-none h-screen max-h-none rounded-none m-0"
            : "w-[95%] max-w-4xl max-h-[90vh]"
        }`}
      >
        {/* ---- Full-screen map mode ---- */}
        {isFullScreen ? (
          <div className="flex flex-col h-full">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background z-10">
              <h2 className="text-lg font-semibold">Select Location</h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMyLocation}
                >
                  <LocateFixed className="h-4 w-4 mr-1" />
                  My Location
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullScreen(false)}
                >
                  <Minimize2 className="h-4 w-4 mr-1" />
                  Done
                </Button>
              </div>
            </div>

            {/* Search bar */}
            <div className="px-4 py-2 border-b bg-background z-10">
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
            </div>

            {/* Map fills remaining space */}
            <div className="flex-1 relative">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Center pin overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
                <div
                  className={`transition-transform duration-150 ${isDragging ? "-translate-y-3 scale-110" : "translate-y-0 scale-100"}`}
                >
                  <MapPin className="h-10 w-10 text-red-500 drop-shadow-lg" fill="currentColor" strokeWidth={1.5} />
                </div>
                {/* Shadow dot */}
                <div
                  className={`w-2 h-1 bg-black/30 rounded-full mx-auto transition-all duration-150 ${isDragging ? "w-3 opacity-40" : "w-2 opacity-60"}`}
                />
              </div>

              {/* Coords badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg z-10 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-mono text-xs">
                  {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                </span>
                {isReverseGeocoding && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
              </div>

              {/* Loading overlay */}
              {!isMapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* ---- Normal modal mode ---- */}
            <FormHeader
              title={isCreate ? "Add New Location" : "Edit Location"}
              description={
                isCreate
                  ? "Move the map to position the pin, then fill in details"
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
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      {reduxError}
                    </p>
                  </div>
                )}

                <div className="space-y-5">
                  {/* --- Map Section --- */}
                  <div className="space-y-2">
                    {/* Search + actions row */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search for a place..."
                          className="pl-10"
                          autoComplete="off"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleMyLocation}
                        title="My Location"
                      >
                        <LocateFixed className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsFullScreen(true)}
                        title="Full Screen Map"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Map with center pin */}
                    <div className="relative rounded-lg overflow-hidden border">
                      <div
                        ref={mapContainerRef}
                        className="w-full h-[280px]"
                      />

                      {/* Center pin overlay */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
                        <div
                          className={`transition-transform duration-150 ${isDragging ? "-translate-y-3 scale-110" : "translate-y-0 scale-100"}`}
                        >
                          <MapPin
                            className="h-9 w-9 text-red-500 drop-shadow-lg"
                            fill="currentColor"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div
                          className={`w-2 h-1 bg-black/30 rounded-full mx-auto transition-all duration-150 ${isDragging ? "w-3 opacity-40" : "w-2 opacity-60"}`}
                        />
                      </div>

                      {/* Loading overlay */}
                      {!isMapReady && (
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

                    {/* Coords bar */}
                    {(latitude !== 0 || longitude !== 0) && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                        <MapPin className="h-3 w-3 text-red-500" />
                        <span className="font-mono">
                          {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                        </span>
                        {isReverseGeocoding && (
                          <Loader2 className="h-3 w-3 animate-spin ml-1" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* --- Label --- */}
                  <TextField
                    control={control}
                    name="label"
                    label="Label"
                    placeholder="e.g., Home, Office, Shop"
                    required
                    disabled={isSubmitting}
                    error={errors.label}
                  />

                  {/* --- Address Fields --- */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Address Details</h3>
                    <p className="text-xs text-muted-foreground">
                      Auto-filled from the map. You can edit manually if needed.
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

                  {/* --- Note --- */}
                  <TextareaField
                    control={control}
                    name="note"
                    label="Note"
                    placeholder="Additional delivery instructions or notes"
                    rows={3}
                    disabled={isSubmitting}
                    error={errors.note}
                  />

                  {/* --- Primary --- */}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
