import { AccountStatus, ProductStatus, Status, UserRole } from "./status";

export const USER_ROLE_FILTER = [
  { value: UserRole.ALL, label: "All Roles" },

  { value: UserRole.DEVELOPER, label: "Developer" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.STAFF, label: "Staff" },
];

export const DELIVERY_OPTIONS_FILTER = [
  { value: Status.ALL, label: "All Status" },
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Draft" },
];

// Auto renew filter options
export const AUTO_RENEW_FILTER = [
  { value: Status.ALL, label: "All Status" },
  { value: Status.ACTIVE, label: "Auto Renew" },
  { value: Status.INACTIVE, label: "Manual Renew" },
];

export const STATUS_FILTER = [
  { value: Status.ALL, label: "All Status" },
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Inactive" },
];

export const SUBSCRIPT_STATUS_FILTER = [
  { value: Status.ALL, label: "All Status" },
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Expried" },
];

export const ACCOUNT_STATUS_FILTER = [
  { value: AccountStatus.ALL, label: "All Status" },
  { value: AccountStatus.ACTIVE, label: "Active" },
  { value: AccountStatus.INACTIVE, label: "Inactive" },
  { value: AccountStatus.LOCKED, label: "Locked" },
  { value: AccountStatus.SUSPENDED, label: "Suspended" },
];

export const PRODUCT_STATUS_FILTER = [
  { value: ProductStatus.ALL, label: "All Status" },
  { value: ProductStatus.ACTIVE, label: "Active" },
  { value: ProductStatus.INACTIVE, label: "Draft" },
  { value: ProductStatus.OUT_OF_STOCK, label: "Out of Stock" },
];
