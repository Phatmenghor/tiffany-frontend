export interface CreateLocationRequest {
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

export interface UpdateLocationRequest {
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

export interface UpdateLocationParams {
  locationId: string;
  locationData: UpdateLocationRequest;
}
