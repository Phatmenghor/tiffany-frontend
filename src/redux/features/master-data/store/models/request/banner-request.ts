import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllBannerRequest extends BaseGetAllRequest {
  status?: string;
}

export interface UpdateBannerParams {
  id: string;
  payload: UpdateBannerRequest;
}

export interface UpdateBannerRequest {
  imageUrl: string;
  linkUrl?: string;
  status: string;
}

export interface CreateBannerRequest {
  imageUrl: string;
  linkUrl?: string;
  status: string;
}
