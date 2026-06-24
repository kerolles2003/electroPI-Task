export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

/**
 * Object storage contract. Implementations (Cloudinary, local disk, etc.) are
 * swappable behind the STORAGE_PROVIDER token. Extend per feature.
 */
export interface StorageProvider {
  upload(key: string, data: Buffer): Promise<string>;
  delete(key: string): Promise<void>;
}
