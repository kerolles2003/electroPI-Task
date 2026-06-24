import { Module } from '@nestjs/common';

import { CloudinaryStorageProvider } from './cloudinary/cloudinary-storage.provider';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';

/**
 * Binds the STORAGE_PROVIDER token to the active implementation. Consumers
 * inject the token (not the concrete class), so swapping providers is a one-line
 * change here. CloudinaryStorageProvider is the active implementation.
 */
@Module({
  providers: [{ provide: STORAGE_PROVIDER, useClass: CloudinaryStorageProvider }],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
