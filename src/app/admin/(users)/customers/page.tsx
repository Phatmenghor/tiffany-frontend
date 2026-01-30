"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { userTableColumns } from "@/redux/features/auth/table/users-table";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useUsersState } from "@/redux/features/auth/store/state/users-state";
import { usePagination } from "@/redux/store/use-pagination";
import {
  deleteUserService,
  fetchAllUsersService,
} from "@/redux/features/auth/store/thunks/users-thunks";
import {
  setPageNo,
  setRoleFilter,
  setSearchFilter,
  resetState,
} from "@/redux/features/auth/store/slice/users-slice";
import { UserResponseModel } from "@/redux/features/auth/store/models/response/users-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { ModalMode, UserRole } from "@/constants/status/status";
import UsersModal from "@/redux/features/auth/components/users-modal";
import { UsersDetailModal } from "@/redux/features/auth/components/users-detail-modal";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import { USER_ROLE_FILTER } from "@/constants/status/filter-status";
import { customerTableColumns } from "@/redux/features/auth/table/customer-table";

export default function CustomerPage() {
  useAdminCleanup(resetState);

  const searchParams = useSearchParams();

  // Redux state
  const {
    userState,
    usersData,
    usersContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useUsersState();

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    userId: "",
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.USERS,
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
      fetchAllUsersService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        roles: [UserRole.CUSTOMER],
      }),
    );
  }, [dispatch, debouncedSearch, filters.role, filters.pageNo, globalPageSize]);

  const handleViewDetail = (user: UserResponseModel) => {
    setDetailModalState({
      isOpen: true,
      userId: user.id || "",
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleViewUserDetail: handleViewDetail,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      customerTableColumns({
        data: usersData,
        handlers: tableHandlers,
      }),
    [userState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleRoleChange = (role: UserRole) => {
    dispatch(setRoleFilter(role));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      userId: "",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Customers", href: "" },
          ]}
          title="Customer Management"
          searchValue={filters.search}
          searchPlaceholder="Search customers..."
          buttonIcon={<Plus className="w-3 h-3" />}
          onSearchChange={handleSearchChange}
        >
          <div className="flex items-center gap-3">
            <CustomSelect
              options={USER_ROLE_FILTER}
              value={filters.role}
              placeholder="All Roles"
              onValueChange={(value) => handleRoleChange(value as UserRole)}
              label="User Role"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={usersContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No users found"
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

      {/* Modals User Detail */}
      <UsersDetailModal
        userId={detailModalState.userId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
}
