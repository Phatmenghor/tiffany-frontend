import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import {
  AllCategoriesResponseModel,
  CategoriesResponseModel,
} from "../store/models/response/categories-response";

interface CategoriesTableHandlers {
  handleEditCategories: (categories: CategoriesResponseModel) => void;
  handleCategoriesViewDetail: (categories: CategoriesResponseModel) => void;
  handleDeleteCategories: (categories: CategoriesResponseModel) => void;
}

interface CategoriesTableOptions {
  data: AllCategoriesResponseModel | null;
  handlers: CategoriesTableHandlers;
}

export const categoriesTableColumns = ({
  data,
  handlers,
}: CategoriesTableOptions): TableColumn<CategoriesResponseModel>[] => {
  const {
    handleEditCategories,
    handleCategoriesViewDetail,
    handleDeleteCategories,
  } = handlers;

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
      label: "Categories Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => {
        return (
          <CustomAvatar
            imageUrl={categories.imageUrl}
            name={categories?.name}
            size="md"
          />
        );
      },
    },

    {
      key: "name",
      label: "Categories Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => (
        <span className="text-xs text-muted-foreground">
          {categories?.name || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => (
        <span className="text-xs text-muted-foreground">
          {categories?.status || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(categories?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleCategoriesViewDetail(categories)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Brand"
            onClick={() => handleEditCategories(categories)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Brand"
            onClick={() => handleDeleteCategories(categories)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
