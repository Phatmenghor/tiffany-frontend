import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { CategoriesResponseModel } from "../store/models/response/categories-response";
import {
  AllSubCategoriesResponseModel,
  SubCategoriesResponseModel,
} from "../store/models/response/sub-categories-response";

interface SubCategoriesTableHandlers {
  handleEditSubCategories: (subCategory: SubCategoriesResponseModel) => void;
  handleSubCategoriesViewDetail: (
    subCategory: SubCategoriesResponseModel,
  ) => void;
  handleDeleteSubCategories: (subCategory: SubCategoriesResponseModel) => void;
}

interface SubCategoriesTableOptions {
  data: AllSubCategoriesResponseModel | null;
  handlers: SubCategoriesTableHandlers;
}

export const subCategoriesTableColumns = ({
  data,
  handlers,
}: SubCategoriesTableOptions): TableColumn<SubCategoriesResponseModel>[] => {
  const {
    handleEditSubCategories,
    handleSubCategoriesViewDetail,
    handleDeleteSubCategories,
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
      label: "Sub-Categories Name",
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
      key: "categoryName",
      label: "Category Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => (
        <span className="text-xs text-muted-foreground">
          {categories?.categoryName || "---"}
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
            onClick={() => handleSubCategoriesViewDetail(categories)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Sub-Categories"
            onClick={() => handleEditSubCategories(categories)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Sub-Categories"
            onClick={() => handleDeleteSubCategories(categories)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
