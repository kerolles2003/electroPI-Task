/**
 * Shared validation and upload constants for the products module. Centralized so
 * DTOs, the controller (interceptor limits), and the service all reference the
 * same values instead of scattered magic numbers/strings.
 */

// ---- Field validation limits ----
export const PRODUCT_NAME_MIN_LENGTH = 1;
export const PRODUCT_NAME_MAX_LENGTH = 200;

export const PRODUCT_DESCRIPTION_MIN_LENGTH = 1;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 5000;

export const PRODUCT_SLUG_MAX_LENGTH = 220;

export const PRODUCT_SEARCH_MAX_LENGTH = 200;

// ---- Price (mirrors Prisma Decimal(10, 2)) ----
export const PRODUCT_PRICE_MIN = 0;
export const PRODUCT_PRICE_MAX = 99_999_999.99;
export const PRODUCT_PRICE_MAX_DECIMALS = 2;

// ---- Image upload constraints ----
/** Multipart field name carrying the product image. */
export const PRODUCT_IMAGE_FIELD = 'image';

/** Cloudinary public_id namespace for product images. */
export const PRODUCT_IMAGE_FOLDER = 'electro-pi/products';

/** Maximum accepted image size in bytes (5 MB). */
export const PRODUCT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** MIME types accepted for product image uploads. */
export const ALLOWED_IMAGE_MIME_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
