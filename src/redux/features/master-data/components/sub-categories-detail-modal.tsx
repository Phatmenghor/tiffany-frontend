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
import { selectIsFetchingDetail } from "../store/selectors/sub-categories-selector";
import { selectSelectedCategories } from "../store/selectors/categories-selector";
import { fetchSubCategoriesByIdService } from "../store/thunks/sub-categories-thunks";
import { clearSelectedSubCategories } from "../store/slice/sub-categories-slice";

interface SubCategoriesDetailModalProps {
  subCategoriesId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SubCategoriesDetailModal({
  subCategoriesId,
  isOpen,
  onClose,
}: SubCategoriesDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const subCategoriesData = useAppSelector(selectSelectedCategories);

  useEffect(() => {
    const fetchSubCategoryData = async () => {
      if (!subCategoriesId || !isOpen) return;

      try {
        await dispatch(fetchSubCategoriesByIdService(subCategoriesId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching sub categories data:", error);
      }
    };

    fetchSubCategoryData();
  }, [subCategoriesId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedSubCategories());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Sub Categories information Details"}
      description={
        subCategoriesData?.name || "Loading sub categories information..."
      }
    >
      {subCategoriesData ? (
        <div className="space-y-6">
          {/* Sub Categories Information */}
          <DetailSection title="Personal Information">
            <CustomAvatar
              imageUrl={subCategoriesData.imageUrl}
              name={subCategoriesData?.name}
              size="xl"
            />

            <DetailRow
              label="Sub Categories Name"
              value={subCategoriesData?.name || "---"}
            />

            <DetailRow
              label="Status"
              value={subCategoriesData?.status || "---"}
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Sub Categories ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {subCategoriesData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(subCategoriesData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={subCategoriesData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(subCategoriesData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={subCategoriesData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No Sub Categories data available
          </p>
        </div>
      )}
    </DetailModal>
  );
}
