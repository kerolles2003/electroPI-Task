import { Module } from '@nestjs/common';

import { StorageModule } from '../../providers/storage/storage.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductRepository } from './repositories/product.repository';

@Module({
  // CategoriesModule exports CategoryRepository (category resolution); StorageModule
  // provides the STORAGE_PROVIDER token (Cloudinary) for image uploads.
  imports: [CategoriesModule, StorageModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
  // Exported so the cart module can verify product existence/availability through
  // the single Product data-access point.
  exports: [ProductRepository],
})
export class ProductsModule {}
