/**
 * Shared validation limits for the categories module. Kept here so DTOs and any
 * future consumers reference a single source of truth instead of magic values.
 */
export const CATEGORY_NAME_MIN_LENGTH = 1;
export const CATEGORY_NAME_MAX_LENGTH = 120;

export const CATEGORY_SLUG_MAX_LENGTH = 140;

export const CATEGORY_SORT_ORDER_MIN = 0;
export const CATEGORY_SORT_ORDER_DEFAULT = 0;
