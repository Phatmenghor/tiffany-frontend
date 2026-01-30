export interface UserAuthResponseModel {
  accessToken: string;
  tokenType: string;
  userId: string;
  userIdentifier: string;
  email: string;
  fullName: string;
  profileImageUrl: string;
  role: string;
}
