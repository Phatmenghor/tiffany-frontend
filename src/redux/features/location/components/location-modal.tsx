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
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editData?: LocationResponseModel | null;
  initialCoords?: { lat: number; lng: number } | null;
};

// ---------------------------------------------------------------------------
// Load Google Maps script once (returns when google.maps.Map is available)
// ---------------------------------------------------------------------------
let gmapLoadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (gmapLoadPromise) return gmapLoadPromise;

  gmapLoadPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.maps?.Map) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    ) as HTMLScriptElement | null;

    if (existing) {
      const wait = () => {
        const id = setInterval(() => {
          if (window.google?.maps?.Map) {
            clearInterval(id);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(id);
          if (window.google?.maps?.Map) resolve();
          else reject(new Error("Timeout waiting for Google Maps"));
        }, 10000);
      };
      wait();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const id = setInterval(() => {
        if (window.google?.maps?.Map) {
          clearInterval(id);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(id);
        if (window.google?.maps?.Map) resolve();
        else reject(new Error("Google Maps script loaded but Map unavailable"));
      }, 10000);
    };
    script.onerror = () => {
      gmapLoadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  gmapLoadPromise.catch(() => {
    gmapLoadPromise = null;
  });

  return gmapLoadPromise;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
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

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const normalSearchInputRef = useRef<HTMLInputElement>(null);
  const fullscreenSearchInputRef = useRef<HTMLInputElement>(null);
  const normalAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const fullscreenAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setValueRef = useRef<typeof setValue>(null!);

  // State
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

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

  // Keep setValue ref current so idle callback never goes stale
  setValueRef.current = setValue;

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // ------------------------------------------------------------------
  // Reverse geocode using google.maps.Geocoder (client-side, no REST)
  // ------------------------------------------------------------------
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = geocoderRef.current;
    if (!geocoder) return;

    setIsReverseGeocoding(true);

    geocoder.geocode(
      { location: { lat, lng } },
      (
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus,
      ) => {
        setIsReverseGeocoding(false);

        if (status !== "OK" || !results || results.length === 0) {
          console.warn("Geocoder failed:", status);
          return;
        }

        const components = results[0].address_components || [];
        let streetNumber = "";
        let village = "";
        let commune = "";
        let district = "";
        let province = "";
        let country = "";

        for (const comp of components) {
          const t = comp.types;
          if (t.includes("street_number")) {
            streetNumber = comp.long_name;
          } else if (t.includes("route")) {
            streetNumber = streetNumber
              ? `${streetNumber} ${comp.long_name}`
              : comp.long_name;
          } else if (
            t.includes("sublocality_level_1") ||
            t.includes("sublocality")
          ) {
            village = comp.long_name;
          } else if (t.includes("locality")) {
            commune = comp.long_name;
          } else if (t.includes("administrative_area_level_2")) {
            district = comp.long_name;
          } else if (t.includes("administrative_area_level_1")) {
            province = comp.long_name;
          } else if (t.includes("country")) {
            country = comp.long_name;
          }
        }

        const sv = setValueRef.current;
        sv("streetNumber", streetNumber, { shouldDirty: true });
        sv("village", village, { shouldDirty: true });
        sv("commune", commune, { shouldDirty: true });
        sv("district", district, { shouldDirty: true });
        sv("province", province, { shouldDirty: true });
        sv("country", country, { shouldDirty: true });
      },
    );
  }, []);

  // ------------------------------------------------------------------
  // Map idle handler – reads map center, updates coords + geocodes
  // Called directly by Google Maps event, so must use refs for freshness.
  // ------------------------------------------------------------------
  const onMapIdle = useCallback(() => {
    const map = googleMapRef.current;
    if (!map) return;
    const center = map.getCenter();
    if (!center) return;

    const lat = center.lat();
    const lng = center.lng();

    const sv = setValueRef.current;
    sv("latitude", lat, { shouldDirty: true });
    sv("longitude", lng, { shouldDirty: true });
    setIsDragging(false);

    // Debounce geocoding
    if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    geocodeTimeoutRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 400);
  }, [reverseGeocode]);

  // ------------------------------------------------------------------
  // Setup autocomplete for a search input
  // ------------------------------------------------------------------
  const setupAutocomplete = useCallback(
    (
      input: HTMLInputElement,
      autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>,
    ) => {
      const map = googleMapRef.current;
      if (!map || !google.maps.places) return;

      // Clear existing autocomplete if any
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["geocode", "establishment"],
      });
      autocomplete.bindTo("bounds", map);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
          // idle event will fire automatically after setCenter
        }
      });
      autocompleteRef.current = autocomplete;
    },
    [],
  );

  // ------------------------------------------------------------------
  // Initialize Google Map
  // ------------------------------------------------------------------
  const initMap = useCallback(
    (container: HTMLDivElement, lat: number, lng: number) => {
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
      geocoderRef.current = new google.maps.Geocoder();

      // Pin animation states
      map.addListener("dragstart", () => setIsDragging(true));
      map.addListener("dragend", () => setIsDragging(false));

      // On idle -> update coords + reverse geocode
      map.addListener("idle", onMapIdle);

      // Set initial form values
      const sv = setValueRef.current;
      sv("latitude", lat, { shouldDirty: true });
      sv("longitude", lng, { shouldDirty: true });

      // Initial reverse geocode
      reverseGeocode(lat, lng);

      // Setup autocomplete for normal search input
      if (normalSearchInputRef.current && google.maps.places) {
        setupAutocomplete(normalSearchInputRef.current, normalAutocompleteRef);
      }
    },
    [onMapIdle, reverseGeocode, setupAutocomplete],
  );

  // ------------------------------------------------------------------
  // Load script & init map when modal opens
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) {
      setIsMapReady(false);
      setIsFullScreen(false);
      setMapError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await loadGoogleMapsScript();
        if (!cancelled) setIsMapReady(true);
      } catch (err: any) {
        if (!cancelled) setMapError(err?.message || "Failed to load map");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // When ready, create the map
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
      // Default: Phnom Penh
      lat = 11.5564;
      lng = 104.9282;
    }

    initMap(mapContainerRef.current, lat, lng);

    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
      googleMapRef.current = null;
      geocoderRef.current = null;
      normalAutocompleteRef.current = null;
      fullscreenAutocompleteRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady]);

  // ------------------------------------------------------------------
  // Handle fullscreen mode changes - resize map and setup autocomplete
  // ------------------------------------------------------------------
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !isMapReady) return;

    // Trigger map resize after DOM updates
    const resizeTimeout = setTimeout(() => {
      google.maps.event.trigger(map, "resize");
      // Re-center the map after resize
      const center = map.getCenter();
      if (center) {
        map.setCenter(center);
      }
    }, 100);

    // Setup autocomplete for fullscreen search input when entering fullscreen
    if (isFullScreen && fullscreenSearchInputRef.current && google.maps.places) {
      // Small delay to ensure the input is mounted
      const autocompleteTimeout = setTimeout(() => {
        if (fullscreenSearchInputRef.current) {
          setupAutocomplete(fullscreenSearchInputRef.current, fullscreenAutocompleteRef);
        }
      }, 150);
      return () => {
        clearTimeout(resizeTimeout);
        clearTimeout(autocompleteTimeout);
      };
    }

    return () => clearTimeout(resizeTimeout);
  }, [isFullScreen, isMapReady, setupAutocomplete]);

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
  // My location
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
      () => showToast.error("Unable to retrieve your location"),
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
  // Shared UI pieces
  // ------------------------------------------------------------------
  const CenterPin = ({ size = "h-9 w-9" }: { size?: string }) => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
      <div
        className={`transition-transform duration-150 ${isDragging ? "-translate-y-3 scale-110" : "translate-y-0 scale-100"}`}
      >
        <MapPin
          className={`${size} text-red-500 drop-shadow-lg`}
          fill="currentColor"
          strokeWidth={1.5}
        />
      </div>
      <div
        className={`h-1 bg-black/30 rounded-full mx-auto transition-all duration-150 ${isDragging ? "w-3 opacity-40" : "w-2 opacity-60"}`}
      />
    </div>
  );

  const CoordsBadge = ({ className = "" }: { className?: string }) => (
    <div
      className={`flex items-center gap-2 text-xs ${className}`}
    >
      <MapPin className="h-3 w-3 text-red-500 shrink-0" />
      <span className="font-mono">
        {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
      </span>
      {isReverseGeocoding && (
        <Loader2 className="h-3 w-3 animate-spin shrink-0" />
      )}
    </div>
  );

  const MapErrorBanner = () => (
    <div className="absolute top-2 left-2 right-2 z-20 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
      <div className="text-xs text-yellow-800">
        <p className="font-medium">Google Maps API key issue</p>
        <p className="mt-0.5">
          Enable Maps JavaScript API, Geocoding API &amp; Places API in your{" "}
          <span className="font-medium">Google Cloud Console</span>, and ensure
          billing is active.
        </p>
      </div>
    </div>
  );

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`p-0 flex flex-col transition-all duration-300 overflow-hidden ${
          isFullScreen
            ? "w-screen max-w-none h-screen max-h-none rounded-none m-0"
            : "w-[95%] max-w-4xl max-h-[90vh]"
        }`}
        onInteractOutside={(e) => {
          // Prevent dialog from closing when clicking on Google Places autocomplete dropdown
          const target = e.target as HTMLElement;
          if (target.closest(".pac-container")) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          // Prevent dialog from closing when clicking on Google Places autocomplete dropdown
          const target = e.target as HTMLElement;
          if (target.closest(".pac-container")) {
            e.preventDefault();
          }
        }}
      >
        {/* ============================================================ */}
        {/*  FULL-SCREEN MAP MODE OVERLAY (without map - map stays in normal position) */}
        {/* ============================================================ */}
        {isFullScreen && (
          <div className="absolute inset-0 z-50 flex flex-col bg-background">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background z-10 shrink-0">
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

            {/* Search */}
            <div className="px-4 py-2 border-b bg-background z-10 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={fullscreenSearchInputRef}
                  type="text"
                  placeholder="Search for a place..."
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Fullscreen map area - the actual map div is portaled here via fixed positioning */}
            <div className="flex-1 relative" id="fullscreen-map-area">
              <CenterPin size="h-10 w-10" />

              {/* Coords */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg z-10">
                <CoordsBadge />
              </div>

              {!isMapReady && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {mapError && <MapErrorBanner />}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/*  NORMAL MODAL MODE - Always rendered but hidden when fullscreen */}
        {/* ======================================================== */}
        <div className={isFullScreen ? "invisible h-0 overflow-hidden" : ""}>
          <FormHeader
            title={isCreate ? "Add New Location" : "Edit Location"}
            description={
              isCreate
                ? "Move the map to position the pin, then fill in details"
                : "Update your location information"
            }
            isCreate={isCreate}
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`flex flex-col flex-1 overflow-hidden ${isFullScreen ? "invisible h-0" : ""}`}
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
                {/* Search + actions */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={normalSearchInputRef}
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

                {/* Map with center pin - ALWAYS rendered, uses fixed position when fullscreen */}
                <div
                  className={`relative ${
                    isFullScreen
                      ? "fixed inset-0 z-[49] top-[105px] visible" // Position below fullscreen header+search, z-49 to be under overlay UI, visible to override parent's invisible
                      : "rounded-lg overflow-hidden border"
                  }`}
                >
                  <div
                    ref={mapContainerRef}
                    className={isFullScreen ? "w-full h-full visible" : "w-full h-[280px]"}
                  />
                  {!isFullScreen && <CenterPin />}

                  {!isFullScreen && !isMapReady && !mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Loading map...
                        </span>
                      </div>
                    </div>
                  )}

                  {!isFullScreen && mapError && <MapErrorBanner />}
                </div>

                {/* Coords bar */}
                {!isFullScreen && (latitude !== 0 || longitude !== 0) && (
                  <div className="bg-muted/50 px-3 py-2 rounded-md">
                    <CoordsBadge className="text-muted-foreground" />
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
                        required
                        disabled={isSubmitting}
                        error={errors.houseNumber}
                      />
                      <TextField
                        control={control}
                        name="streetNumber"
                        label="Street"
                        placeholder="Enter street"
                        required
                        disabled={isSubmitting}
                        error={errors.streetNumber}
                      />
                      <TextField
                        control={control}
                        name="village"
                        label="Village / Sangkat"
                        placeholder="Enter village"
                        required
                        disabled={isSubmitting}
                        error={errors.village}
                      />
                      <TextField
                        control={control}
                        name="commune"
                        label="Commune / City"
                        placeholder="Enter commune"
                        required
                        disabled={isSubmitting}
                        error={errors.commune}
                      />
                      <TextField
                        control={control}
                        name="district"
                        label="District / Khan"
                        placeholder="Enter district"
                        required
                        disabled={isSubmitting}
                        error={errors.district}
                      />
                      <TextField
                        control={control}
                        name="province"
                        label="Province"
                        placeholder="Enter province"
                        required
                        disabled={isSubmitting}
                        error={errors.province}
                      />
                      <TextField
                        control={control}
                        name="country"
                        label="Country"
                        placeholder="Enter country"
                        required
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
      </DialogContent>
    </Dialog>
  );
}
