import { Injectable } from '@nestjs/common';

import { StorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  upload(_key: string, _data: Buffer): Promise<string> {
    throw new Error('LocalStorageProvider.upload not implemented yet');
  }

  delete(_key: string): Promise<void> {
    throw new Error('LocalStorageProvider.delete not implemented yet');
  }
}
