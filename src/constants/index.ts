export const USER_ROLES = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const RESERVATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export const TABLE_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  MAINTENANCE: "maintenance",
} as const;

export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];

export const TIME_SLOTS = [
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "18:00-19:00",
  "19:00-20:00",
  "20:00-21:00",
  "21:00-22:00",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 20;
export const SALT_ROUNDS = 12;
