import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";

export const useFavoriteState = () => {
  const dispatch = useDispatch<AppDispatch>();
  const favorites = useSelector((state: RootState) => state.favorites);

  return {
    dispatch,
    items: favorites.items,
    totalItems: favorites.totalItems,
    loading: favorites.loading,
    error: favorites.error,
    loaded: favorites.loaded,
  };
};
