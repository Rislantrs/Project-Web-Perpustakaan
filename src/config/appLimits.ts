// Common operational limits and constants used across the app.
// Adjust values to match backend/server-side policies.

export const APP_LIMITS = {
  MAX_UPLOAD_MB: 10,
  MAX_IMAGE_WIDTH_PX: 2000,
  MAX_IMAGE_HEIGHT_PX: 2000,
  ITEMS_PER_PAGE: 20,
  SESSION_TIMEOUT_SECONDS: 60 * 60, // 1 hour
  VERIFICATION_CODE_LENGTH: 6,
  VERIFICATION_CODE_TTL_SECONDS: 60 * 5, // 5 minutes
  DEFAULT_PAGE_SIZE: 20,
};

export type AppLimits = typeof APP_LIMITS;

export default APP_LIMITS;
