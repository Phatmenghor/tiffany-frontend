"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import {
  selectIsFetchingDetail,
  selectSelectedCategories,
} from "../store/selectors/categories-selector";
import { fetchCategoriesByIdService } from "../store/thunks/categories-thunks";
import { clearSelectedCategories } from "../store/slice/categories-slice";

interface CategoriesDetailModalProps {
  categoriesId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoriesDetailModal({
  categoriesId,
  isOpen,
  onClose,
}: CategoriesDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const categoriesData = useAppSelector(selectSelectedCategories);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categoriesId || !isOpen) return;

      try {
        await dispatch(fetchCategoriesByIdService(categoriesId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching categories data:", error);
      }
    };

    fetchCategoryData();
  }, [categoriesId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedCategories());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Categories information Details"}
      description={categoriesData?.name || "Loading categories information..."}
    >
      {categoriesData ? (
        <div className="space-y-6">
          {/* Categories Information */}
          <DetailSection title="Personal Information">
            <CustomAvatar
              imageUrl={categoriesData.imageUrl}
              name={categoriesData?.name}
              size="xl"
            />

            <DetailRow
              label="Categories Name"
              value={categoriesData?.name || "---"}
            />

            <DetailRow label="Status" value={categoriesData?.status || "---"} />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Categories ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {categoriesData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(categoriesData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={categoriesData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(categoriesData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={categoriesData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Categories data available</p>
        </div>
      )}
    </DetailModal>
  );
}
