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
  selectSelectedPayment,
} from "../store/selectors/payment-selector";
import { fetchPaymentByIdService } from "../store/thunks/payment-thunks";
import { clearSelectedPayment } from "../store/slice/payment-slice";

interface PaymentDetailModalProps {
  paymentId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentDetailModal({
  paymentId,
  isOpen,
  onClose,
}: PaymentDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const paymentData = useAppSelector(selectSelectedPayment);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!paymentId || !isOpen) return;
      try {
        await dispatch(fetchPaymentByIdService(paymentId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching payment data:", error);
      }
    };

    fetchPaymentData();
  }, [paymentId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedPayment());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Payment information Details"}
      description={paymentData?.name || "Loading payment information..."}
    >
      {paymentData ? (
        <div className="space-y-6">
          {/* Payment Information */}
          <DetailSection title="Personal Information">
            <CustomAvatar
              imageUrl={paymentData.qrCodeImageUrl}
              name={paymentData?.name}
              size="xl"
            />

            <DetailRow
              label="Payment Name"
              value={paymentData?.name || "---"}
            />

            <DetailRow
              label="Payment Type"
              value={paymentData?.type || "---"}
            />

            <DetailRow
              label="Bank Name"
              value={paymentData?.bankName || "---"}
            />

            <DetailRow
              label="Account Number"
              value={paymentData?.accountNumber || "---"}
            />

            <DetailRow
              label="Account Name"
              value={paymentData?.accountName || "---"}
            />

            <DetailRow
              label="Sort Order"
              value={paymentData?.sortOrder || "---"}
            />

            <DetailRow
              label="Is Active"
              value={paymentData?.isActive ? "Yes" : "No"}
            />

            <DetailRow
              label="Description"
              value={paymentData?.description || "---"}
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Payment ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {paymentData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(paymentData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={paymentData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(paymentData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={paymentData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Payment data available</p>
        </div>
      )}
    </DetailModal>
  );
}
