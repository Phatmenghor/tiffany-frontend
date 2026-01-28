import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
  selectRoleContent,
  selectRoles,
  selectRolesState,
} from "../selectors/role-selectors";

export const useRolesState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const rolesState = useAppSelector(selectRolesState);
  const rolesData = useAppSelector(selectRoles);
  const rolesContent = useAppSelector(selectRoleContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    rolesState,
    rolesData,
    rolesContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
