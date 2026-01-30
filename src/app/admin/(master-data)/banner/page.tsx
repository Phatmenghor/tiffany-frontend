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
import { useBannerState } from "@/redux/features/master-data/store/state/banner-state";
import { ModalMode, Status } from "@/constants/status/status";
import { BannerResponseModel } from "@/redux/features/master-data/store/models/response/banner-response";
import { usePagination } from "@/redux/store/use-pagination";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/redux/features/master-data/store/slice/banner-slice";
import {
  deleteBannerService,
  fetchAllBannerService,
} from "@/redux/features/master-data/store/thunks/banner-thunks";
import { bannerTableColumns } from "@/redux/features/master-data/table/banner-table";
import { STATUS_FILTER } from "@/constants/status/filter-status";
import BannerModal from "@/redux/features/master-data/components/banner-modal";
import { BannerDetailModal } from "@/redux/features/master-data/components/banner-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";

export default function BannerPage() {
  useAdminCleanup(resetState);
  const searchParams = useSearchParams();

  // Redux state
  const {
    bannerState,
    bannerData,
    bannerContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useBannerState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    bannerId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    bannerId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    banner: null as BannerResponseModel | null,
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.BANNER,
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
      fetchAllBannerService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        status: filters.status == Status.ALL ? undefined : filters.status,
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.status,
    filters.pageNo,
    globalPageSize,
  ]);

  // Event handlers
  const handleCreateBanner = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      bannerId: "",
    });
  };

  const handleEditBanner = (banner: BannerResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      bannerId: banner?.id || "",
    });
  };

  const handleBannerViewDetail = (banner: BannerResponseModel) => {
    setDetailModalState({
      isOpen: true,
      bannerId: banner.id || "",
    });
  };

  const handleDeleteBanner = (banner: BannerResponseModel) => {
    setDeleteState({
      isOpen: true,
      banner: banner,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditBanner,
      handleBannerViewDetail,
      handleDeleteBanner,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      bannerTableColumns({
        data: bannerData,
        handlers: tableHandlers,
      }),
    [bannerState, tableHandlers],
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
    if (!deleteState.banner?.id) return;

    try {
      await dispatch(deleteBannerService(deleteState.banner.id)).unwrap();

      showToast.success(`Banner deleted successfully`);

      closeDeleteModal();

      if (bannerContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete user business");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      bannerId: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      bannerId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      banner: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Banner", href: "" },
          ]}
          title="Banner Information"
          searchValue={filters.search}
          searchPlaceholder="Search banner..."
          buttonTooltip="Create a new banner"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateBanner}
        >
          <div className="flex items-center gap-3">
            <CustomSelect
              options={STATUS_FILTER}
              value={filters.status}
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Banner Status"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={bannerContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No banners found"
          getRowKey={(user) => user.id}
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
      <BannerModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        bannerId={modalState.bannerId}
        mode={modalState.mode}
      />

      {/* Modals User Detail */}
      <BannerDetailModal
        bannerId={detailModalState.bannerId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete User */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Banner"
        description={`Are you sure you want to delete this banner?`}
        itemName={"This action cannot be undone."}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
