import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectLocations,
  selectLocationIsLoading,
  selectLocationError,
  selectLocationOperations,
} from "../selectors/location-selector";

export const useLocationState = () => {
  const dispatch = useAppDispatch();

  const locations = useAppSelector(selectLocations);
  const isLoading = useAppSelector(selectLocationIsLoading);
  const error = useAppSelector(selectLocationError);
  const operations = useAppSelector(selectLocationOperations);

  return {
    locations,
    isLoading,
    error,
    operations,
    dispatch,
  };
};
