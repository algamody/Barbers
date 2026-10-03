/**
 * System-wide business constants and operational thresholds
 */

// Cash payment restriction: 1 no-show bans cash payment
export const NO_SHOW_CASH_BAN_THRESHOLD = 1

// Customer transfer timeout (2 minutes countdown)
export const CUSTOMER_TRANSFER_TIMEOUT_SECONDS = 120

// Group booking reassignment timeout (2 minutes)
export const GROUP_REASSIGN_TIMEOUT_SECONDS = 120

// Alternative booking fee (priority fee, non-refundable 5 LYD)
export const ALT_BOOKING_FEE = 5

// Alternative booking open window phase (5 minutes = 300 seconds)
export const ALT_OPEN_WINDOW_SECONDS = 300

// Total attendance window (10 minutes = 600 seconds)
export const ATTENDANCE_TOTAL_WINDOW_SECONDS = 600

// Storage keys
export const STORAGE_KEYS = {
  THEME: "barbers_app_theme",
  LANG: "barbers_app_lang",
  AUTH_TOKEN: "barbers_auth_token",
  USER_PROFILE: "barbers_user_profile",
  WALLET_BALANCE: "barbers_wallet_balance",
  FAVORITES: "barbers_favorites",
  ACTIVE_GROUP_BOOKING: "barbers_active_group_booking",
  DRAFT_BOOKING_PREFIX: "barbers_draft_booking_",
} as const
