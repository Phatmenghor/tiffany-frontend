import { RootState } from "@/redux/store";

export const selectSelectedProduct = (state: RootState) =>
  state.aboutUs.selectedAboutUs;

export const selectIsFetchingDetail = (state: RootState) =>
  state.aboutUs.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.aboutUs.error;

export const selectOperations = (state: RootState) => state.aboutUs.operations;
