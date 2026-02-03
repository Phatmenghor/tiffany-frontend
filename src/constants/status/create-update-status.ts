import {
  AccountStatus,
  Payment,
  PaymentStatus,
  ProductStatus,
  PromotionType,
  Status,
  UserRole,
} from "./status";

export const USER_CREATE_UPDATE = [
  { value: UserRole.DEVELOPER, label: "Developer" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.STAFF, label: "Staff" },
];

export const USER_CUSTOMER_ROLE_CREATE_UPDATE = [
  { value: UserRole.CUSTOMER, label: "Customer" },
];

export const STATUS_CREATE_UPDATE = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Draft" },
];

export const PAYMENT_CREATE_UPDATE = [
  { value: Payment.CASH, label: "Cash" },
  { value: Payment.BANK, label: "Bank Transfer" },
];

export const ACCOUNT_STATUS_CREATE_UPDATE = [
  { value: AccountStatus.ACTIVE, label: "Active" },
  { value: AccountStatus.INACTIVE, label: "Inactive" },
  { value: AccountStatus.LOCKED, label: "Locked" },
  { value: AccountStatus.SUSPENDED, label: "Suspended" },
];

export const SUBSCRIPTION_CREATE_UPDATE = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export const PAYMENT_STATUS_CREATE_UPDATE = [
  { value: PaymentStatus.PENDING, label: "Pending" },
  { value: PaymentStatus.COMPLETED, label: "Completed" },
  { value: PaymentStatus.FAILED, label: "Failed" },
  { value: PaymentStatus.CANCELLED, label: "Cancelled" },
];

export const BANNER_STATUS_CREATE_UPDATE = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Draft" },
];

export const DELIVERY_OPTIONS_STATUS_CREATE_UPDATE = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Draft" },
];

export const PRODUCT_STATUS_CREATE_UPDATE = [
  { value: ProductStatus.ACTIVE, label: "Active" },
  { value: ProductStatus.INACTIVE, label: "Draft" },
  { value: ProductStatus.OUT_OF_STOCK, label: "Out of Stock" },
];

export const PROMOTION_TYPE_CREATE_UPDATE = [
  { value: PromotionType.NONE, label: "No Promotion" },
  { value: PromotionType.PERCENTAGE, label: "Percentage" },
  { value: PromotionType.FIXED_AMOUNT, label: "Fixed Amount" },
];
