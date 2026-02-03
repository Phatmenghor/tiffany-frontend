import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import {
  AllPaymentResponseModel,
  PaymentResponseModel,
} from "../store/models/response/payment-response";

interface PaymentTableHandlers {
  handleEditPayment: (payment: PaymentResponseModel) => void;
  handlePaymentViewDetail: (payment: PaymentResponseModel) => void;
  handleDeletePayment: (payment: PaymentResponseModel) => void;
}

interface PaymentTableOptions {
  data: AllPaymentResponseModel | null;
  handlers: PaymentTableHandlers;
}

export const paymentTableColumns = ({
  data,
  handlers,
}: PaymentTableOptions): TableColumn<PaymentResponseModel>[] => {
  const { handleEditPayment, handlePaymentViewDetail, handleDeletePayment } =
    handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "qrCodeImageUrl",
      label: "Payment Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (payment) => {
        return (
          <CustomAvatar
            imageUrl={payment.qrCodeImageUrl}
            name={payment?.name}
            size="md"
          />
        );
      },
    },

    {
      key: "name",
      label: "Payment Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.name || "---"}
        </span>
      ),
    },

    {
      key: "type",
      label: "Payment Type",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.type || "---"}
        </span>
      ),
    },

    {
      key: "bankName",
      label: "Bank Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.bankName || "---"}
        </span>
      ),
    },

    {
      key: "accountNumber",
      label: "Account Number",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.accountNumber || "---"}
        </span>
      ),
    },

    {
      key: "accountName",
      label: "Account Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.accountName || "---"}
        </span>
      ),
    },

    {
      key: "sortOrder",
      label: "Sort Order",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.sortOrder || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      key: "description",
      label: "Description",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.description || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (payment) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(payment?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handlePaymentViewDetail(payment)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Payment"
            onClick={() => handleEditPayment(payment)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Payment"
            onClick={() => handleDeletePayment(payment)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
