/**
 * Canonical slug shape shared by Category and Product: lowercase alphanumeric
 * segments separated by single hyphens (e.g. "gaming-laptops").
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_MESSAGE =
  'slug must be lowercase alphanumeric words separated by single hyphens';
