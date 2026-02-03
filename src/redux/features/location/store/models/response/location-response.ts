export interface LocationResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  userId: string;
  label: string;
  latitude: number;
  longitude: number;
  houseNumber: string;
  streetNumber: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  country: string;
  note: string;
  isPrimary: boolean;
}
