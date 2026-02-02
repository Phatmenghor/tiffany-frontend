import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectError, selectOperations } from "../selectors/about-us-selector";

export const useAboutUsState = () => {
  const dispatch = useAppDispatch();

  const error = useAppSelector(selectError);
  const operations = useAppSelector(selectOperations);

  return {
    operations,
    error,
    dispatch,
  };
};
