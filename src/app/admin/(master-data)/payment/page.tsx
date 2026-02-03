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
} from "@/redux/features/master-data/store/slice/payment-slice";
import { usePaymentState } from "@/redux/features/master-data/store/state/payment-state";
import { PaymentResponseModel } from "@/redux/features/master-data/store/models/response/payment-response";
import {
  deletePaymentService,
  fetchAllPaymentService,
} from "@/redux/features/master-data/store/thunks/payment-thunks";
import { paymentTableColumns } from "@/redux/features/master-data/table/payment-table";
import PaymentModal from "@/redux/features/master-data/components/payment-modal";
import { PaymentDetailModal } from "@/redux/features/master-data/components/payment-detail-modal";

export default function PaymentPage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);
  const searchParams = useSearchParams();

  // Redux state
  const {
    paymentState,
    paymentData,
    paymentContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = usePaymentState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    paymentId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    paymentId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    payment: null as PaymentResponseModel | null,
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.CATEGORIES,
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
      fetchAllPaymentService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        isActive: filters.isActive ?? undefined,
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.isActive,
    filters.pageNo,
    globalPageSize,
  ]);

  // Event handlers
  const handleCreateCategories = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      paymentId: "",
    });
  };

  const handleEditPayment = (payment: PaymentResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      paymentId: payment?.id || "",
    });
  };

  const handlePaymentViewDetail = (payment: PaymentResponseModel) => {
    setDetailModalState({
      isOpen: true,
      paymentId: payment.id || "",
    });
  };

  const handleDeletePayment = (payment: PaymentResponseModel) => {
    setDeleteState({
      isOpen: true,
      payment: payment,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditPayment,
      handlePaymentViewDetail,
      handleDeletePayment,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      paymentTableColumns({
        data: paymentData,
        handlers: tableHandlers,
      }),
    [paymentState, tableHandlers],
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
    if (!deleteState.payment?.id) return;

    try {
      await dispatch(deletePaymentService(deleteState.payment.id)).unwrap();

      showToast.success(
        `Payment "${deleteState.payment.name ?? ""}" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (paymentContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete payment. Please try again.");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      paymentId: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      paymentId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      payment: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Payments", href: "" },
          ]}
          title="Payment Information"
          searchValue={filters.search}
          searchPlaceholder="Search payments..."
          buttonTooltip="Create a new payment"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateCategories}
        >
          <div className="flex items-center gap-3">
            <CustomSelect
              options={STATUS_FILTER}
              value={
                filters.isActive !== undefined
                  ? filters.isActive
                    ? Status.ACTIVE
                    : Status.INACTIVE
                  : Status.ALL
              }
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Payment Status"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={paymentContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Payments found"
          getRowKey={(payment) => payment.id}
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
      <PaymentModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        paymentId={modalState.paymentId}
        mode={modalState.mode}
      />

      {/* Modals Payment Detail */}
      <PaymentDetailModal
        paymentId={detailModalState.paymentId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete User */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Payment"
        description={`Are you sure you want to delete this payment ${
          deleteState.payment?.name || ""
        }?`}
        itemName={deleteState.payment?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
