export enum Status {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum AccountStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  LOCKED = "LOCKED",
  SUSPENDED = "SUSPENDED",
}

// Types
export enum ModalMode {
  CREATE_MODE = "create",
  UPDATE_MODE = "update",
}

export enum UserRole {
  ALL = "ALL",

  DEVELOPER = "DEVELOPER",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  CUSTOMER = "CUSTOMER",
}

export enum Payment {
  ALL = "ALL",

  CASH = "CASH",
  BANK = "BANK",
}

export enum PromotionType {
  ALL = "ALL",
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  NONE = "NONE",
}

export enum PaymentStatus {
  All = "ALL",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum ProductStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}
