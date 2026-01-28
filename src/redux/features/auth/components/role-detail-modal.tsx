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
  selectSelectedRole,
} from "../store/selectors/role-selectors";
import { fetchRoleByIdService } from "../store/thunks/role-thunks";
import { clearSelectedRole } from "../store/slice/role-slice";

interface RoleDetailModalProps {
  roleId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RoleDetailModal({
  roleId,
  isOpen,
  onClose,
}: RoleDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const roleData = useAppSelector(selectSelectedRole);

  useEffect(() => {
    const fetchRoleData = async () => {
      if (!roleId || !isOpen) return;

      try {
        await dispatch(fetchRoleByIdService(roleId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching role data:", error);
      }
    };

    fetchRoleData();
  }, [roleId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedRole());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Role Details"}
      description={"Detailed information about the selected role."}
    >
      {roleData ? (
        <div className="space-y-6">
          {/* Personal Information */}
          <DetailSection title="Personal Information">
            <DetailRow label="Full Name" value={roleData?.name || "---"} />
            <DetailRow
              label="Description"
              value={roleData?.description || "---"}
            />
            <DetailRow
              label="Business ID"
              value={roleData?.businessId || "---"}
            />
            <DetailRow label="User Type" value={roleData?.userType || "---"} />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Role ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {roleData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(roleData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={roleData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(roleData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={roleData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Role data available</p>
        </div>
      )}
    </DetailModal>
  );
}
