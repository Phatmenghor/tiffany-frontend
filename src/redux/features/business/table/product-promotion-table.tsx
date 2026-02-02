import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "../store/models/response/product-response";

interface ProductTableHandlers {
  handleEditProduct: (product: ProductDetailResponseModel) => void;
  handleProductViewDetail: (product: ProductDetailResponseModel) => void;
  handleDeleteProduct: (product: ProductDetailResponseModel) => void;
}

interface ProductPromotionTableOptions {
  data: AllProductResponseModel | null;
  handlers: ProductTableHandlers;
}

export const productPromotionTableColumns = ({
  data,
  handlers,
}: ProductPromotionTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const { handleEditProduct, handleProductViewDetail, handleDeleteProduct } =
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
      key: "imageUrl",
      label: "Product Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => {
        return (
          <CustomAvatar
            imageUrl={product?.mainImageUrl}
            name={product?.name || "No"}
            size="md"
          />
        );
      },
    },

    {
      key: "name",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.name || "---"}
        </span>
      ),
    },

    {
      key: "displayPrice",
      label: "Price",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.displayPrice || "---"}
        </span>
      ),
    },

    {
      key: "displayOriginPrice",
      label: "Origin Price",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.displayOriginPrice || "---"}
        </span>
      ),
    },

    {
      key: "hasSizes",
      label: "Has Sizes",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.hasSizes ? "Have Size" : "None Size"}
        </span>
      ),
    },

    {
      key: "displayPromotionType",
      label: "Promotion Type",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.displayPromotionType || "---"}
        </span>
      ),
    },

    {
      key: "displayPromotionValue",
      label: "Promotion Value",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.displayPromotionValue || "---"}
        </span>
      ),
    },

    {
      key: "displayPromotionValue",
      label: "Promotion From Date",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(product?.displayPromotionFromDate) || "---"}
        </span>
      ),
    },

    {
      key: "displayPromotionToDate",
      label: "Promotion From Date",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(product?.displayPromotionToDate) || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.status || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(product?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleProductViewDetail(product)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Product"
            onClick={() => handleEditProduct(product)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Product"
            onClick={() => handleDeleteProduct(product)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
