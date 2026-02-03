"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectLocations,
  selectLocationIsLoading,
  selectLocationOperations,
} from "@/redux/features/location/store/selectors/location-selector";
import {
  fetchAllLocationsService,
  deleteLocationService,
  updateLocationService,
} from "@/redux/features/location/store/thunks/location-thunks";
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import LocationModal from "@/redux/features/location/components/location-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { Loading } from "@/components/shared/common/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  Navigation,
  StickyNote,
} from "lucide-react";

export default function LocationPage() {
  const dispatch = useAppDispatch();
  const locations = useAppSelector(selectLocations);
  const isLoading = useAppSelector(selectLocationIsLoading);
  const operations = useAppSelector(selectLocationOperations);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<LocationResponseModel | null>(null);
  const [deletingLocation, setDeletingLocation] =
    useState<LocationResponseModel | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  // Fetch locations on mount
  useEffect(() => {
    dispatch(fetchAllLocationsService());
  }, [dispatch]);

  const handleAddLocation = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEditLocation = (location: LocationResponseModel) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDeleteLocation = async () => {
    if (!deletingLocation) return;
    try {
      await dispatch(deleteLocationService(deletingLocation.id)).unwrap();
      showToast.success("Location deleted successfully");
      setDeletingLocation(null);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to delete location");
    }
  };

  const handleSetPrimary = async (location: LocationResponseModel) => {
    if (location.isPrimary) return;
    setSettingPrimaryId(location.id);
    try {
      await dispatch(
        updateLocationService({
          locationId: location.id,
          locationData: {
            label: location.label,
            latitude: location.latitude,
            longitude: location.longitude,
            houseNumber: location.houseNumber || "",
            streetNumber: location.streetNumber || "",
            village: location.village || "",
            commune: location.commune || "",
            district: location.district || "",
            province: location.province || "",
            country: location.country || "",
            note: location.note || "",
            isPrimary: true,
          },
        }),
      ).unwrap();
      showToast.success("Primary location updated");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to set primary location");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
  };

  const formatAddress = (location: LocationResponseModel) => {
    const parts = [
      location.houseNumber,
      location.streetNumber,
      location.village,
      location.commune,
      location.district,
      location.province,
      location.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No address details";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              My Locations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your delivery locations
            </p>
          </div>
          <Button onClick={handleAddLocation}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Location List */}
        {locations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No locations yet
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                Add your first delivery location to get started. You can select
                a location on the map or enter the address manually.
              </p>
              <Button onClick={handleAddLocation}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <Card
                key={location.id}
                className={`relative transition-all hover:shadow-md ${
                  location.isPrimary
                    ? "border-primary ring-1 ring-primary/20"
                    : ""
                }`}
              >
                <CardContent className="p-5">
                  {/* Header: Label + Primary Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          location.isPrimary
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        <MapPin
                          className={`h-4 w-4 ${
                            location.isPrimary
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {location.label}
                        </h3>
                        {location.isPrimary && (
                          <Badge
                            variant="default"
                            className="mt-1 text-xs"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 mb-3">
                    <Navigation className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {formatAddress(location)}
                    </p>
                  </div>

                  {/* Note */}
                  {location.note && (
                    <div className="flex items-start gap-2 mb-4">
                      <StickyNote className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground italic line-clamp-1">
                        {location.note}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    {!location.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleSetPrimary(location)}
                        disabled={settingPrimaryId === location.id}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {settingPrimaryId === location.id
                          ? "Setting..."
                          : "Set Primary"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleEditLocation(location)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive"
                      onClick={() => setDeletingLocation(location)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={editingLocation}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingLocation}
        onClose={() => setDeletingLocation(null)}
        onDelete={handleDeleteLocation}
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
        itemName={deletingLocation?.label}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
