import { AboutUsResponseModel } from "../response/about-us-response";

export interface OperationStates {
  isUpdating: boolean;
  isFetchingDetail: boolean;
}

export interface AboutUsManagementState {
  selectedAboutUs: AboutUsResponseModel | null;
  error: string | null;
  operations: OperationStates;
}
