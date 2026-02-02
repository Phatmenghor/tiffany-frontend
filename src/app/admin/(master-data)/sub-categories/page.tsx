"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, Status } from "@/constants/status/status";
import { usePagination } from "@/redux/store/use-pagination";
import { STATUS_FILTER } from "@/constants/status/filter-status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import {
  resetState,
  setPageNo,
  setSearchFilter,
  setStatusFilter,
} from "@/redux/features/master-data/store/slice/sub-categories-slice";
import { useSubCategoriesState } from "@/redux/features/master-data/store/state/sub-categories-state";
import { SubCategoriesResponseModel } from "@/redux/features/master-data/store/models/response/sub-categories-response";
import {
  deleteSubCategoriesService,
  fetchAllSubCategoriesService,
} from "@/redux/features/master-data/store/thunks/sub-categories-thunks";
import { subCategoriesTableColumns } from "@/redux/features/master-data/table/sub-categories-table";
import SubCategoriesModal from "@/redux/features/master-data/components/sub-categories-modal";
import { SubCategoriesDetailModal } from "@/redux/features/master-data/components/sub-categories-detail-modal";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

export default function CategoriesPage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);
  const searchParams = useSearchParams();

  // Redux state
  const {
    subCategoriesData,
    subCategoriesContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useSubCategoriesState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    subCategoriesId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    subCategoriesId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    subCategories: null as SubCategoriesResponseModel | null,
  });

  const [selectedCategories, setSelectedCategories] =
    useState<CategoriesResponseModel | null>(null);

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.SUB_CATEGORIES,
  });

  // Initialize URL and Redux state on mount
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, filters.pageNo, dispatch]);

  useEffect(() => {
    dispatch(
      fetchAllSubCategoriesService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        categoryId: selectedCategories?.id,
        status: filters.status == Status.ALL ? undefined : filters.status,
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.status,
    filters.pageNo,
    globalPageSize,
    selectedCategories,
  ]);

  // Event handlers
  const handleCreateSubCategories = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      subCategoriesId: "",
    });
  };

  const handleEditSubCategories = (
    subCategories: SubCategoriesResponseModel,
  ) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      subCategoriesId: subCategories?.id || "",
    });
  };

  const handleSubCategoriesViewDetail = (
    subCategories: SubCategoriesResponseModel,
  ) => {
    setDetailModalState({
      isOpen: true,
      subCategoriesId: subCategories.id || "",
    });
  };

  const handleDeleteSubCategories = (
    subCategories: SubCategoriesResponseModel,
  ) => {
    setDeleteState({
      isOpen: true,
      subCategories: subCategories,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditSubCategories,
      handleSubCategoriesViewDetail,
      handleDeleteSubCategories,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      subCategoriesTableColumns({
        data: subCategoriesData,
        handlers: tableHandlers,
      }),
    [subCategoriesData, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: Status) => {
    dispatch(setStatusFilter(status));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleDelete = async () => {
    if (!deleteState.subCategories?.id) return;

    try {
      await dispatch(
        deleteSubCategoriesService(deleteState.subCategories.id),
      ).unwrap();

      showToast.success(
        `Sub-Categories "${deleteState.subCategories.name ?? ""}" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (subCategoriesContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete categories");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      subCategoriesId: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      subCategoriesId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      subCategories: null,
    });
  };

  const handleCategoriesChange = (
    categories: CategoriesResponseModel | null,
  ) => {
    setSelectedCategories(categories);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Sub Categories", href: "" },
          ]}
          title="Sub Categories Information"
          searchValue={filters.search}
          searchPlaceholder="Search sub categories..."
          buttonTooltip="Create a new sub categories"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateSubCategories}
        >
          <div className="flex items-center gap-3">
            <ComboboxSelectCategories
              dataSelect={selectedCategories}
              onChangeSelected={handleCategoriesChange}
              placeholder="All Categires"
              showAllOption={true}
            />

            <CustomSelect
              options={STATUS_FILTER}
              value={filters.status}
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Sub Categories Status"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={subCategoriesContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Sub-Categories found"
          getRowKey={(subCategories) => subCategories.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* Modals Add/Edit */}
      <SubCategoriesModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        subCategoriesId={modalState.subCategoriesId}
        mode={modalState.mode}
      />

      {/* Modals sub categories Detail */}
      <SubCategoriesDetailModal
        subCategoriesId={detailModalState.subCategoriesId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete User */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Sub Categories"
        description={`Are you sure you want to delete this sub categories ${
          deleteState.subCategories?.name || ""
        }?`}
        itemName={deleteState.subCategories?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
