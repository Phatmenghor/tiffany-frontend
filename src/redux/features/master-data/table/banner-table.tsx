import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllBannerResponseModel,
  BannerResponseModel,
} from "../store/models/response/banner-response";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";

interface BannerTableHandlers {
  handleEditBanner: (banner: BannerResponseModel) => void;
  handleBannerViewDetail: (banner: BannerResponseModel) => void;
  handleDeleteBanner: (banner: BannerResponseModel) => void;
}

interface BannerTableOptions {
  data: AllBannerResponseModel | null;
  handlers: BannerTableHandlers;
}

export const bannerTableColumns = ({
  data,
  handlers,
}: BannerTableOptions): TableColumn<BannerResponseModel>[] => {
  const { handleEditBanner, handleBannerViewDetail, handleDeleteBanner } =
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
      label: "Banner Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => {
        return (
          <CustomAvatar
            variant="banner"
            imageUrl={banner.imageUrl}
            name={"Banner Image"}
            bannerHeight="lg"
          />
        );
      },
    },
    {
      key: "linkUrl",
      label: "Link URL",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (banner) => (
        <span className="text-xs text-muted-foreground">
          {banner?.linkUrl || "---"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (banner) => (
        <span className="text-xs text-muted-foreground">
          {banner?.status || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(banner?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleBannerViewDetail(banner)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Banner"
            onClick={() => handleEditBanner(banner)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Banner"
            onClick={() => handleDeleteBanner(banner)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
