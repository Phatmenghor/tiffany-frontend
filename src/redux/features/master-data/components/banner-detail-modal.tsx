"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedBanner,
} from "../store/selectors/banner-selector";
import { fetchBannerByIdService } from "../store/thunks/banner-thunks";
import { clearSelectedBanner } from "../store/slice/banner-slice";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";

interface BannerDetailModalProps {
  bannerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BannerDetailModal({
  bannerId,
  isOpen,
  onClose,
}: BannerDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const bannerData = useAppSelector(selectSelectedBanner);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!bannerId || !isOpen) return;

      try {
        await dispatch(fetchBannerByIdService(bannerId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [bannerId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBanner());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Banner information Details"}
      description={"Banner information"}
    >
      {bannerData ? (
        <div className="space-y-6">
          {/* Banner Information */}
          <DetailSection title="Personal Information">
            <CustomAvatar
              variant="banner"
              imageUrl={bannerData.imageUrl}
              name={"Banner Image"}
              bannerHeight="xl"
            />
            <DetailRow label="Link URL" value={bannerData?.linkUrl || "---"} />
            <DetailRow
              label="Status"
              value={bannerData?.status || "---"}
              isLast
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Banner ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {bannerData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(bannerData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={bannerData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(bannerData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={bannerData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No banner data available</p>
        </div>
      )}
    </DetailModal>
  );
}
