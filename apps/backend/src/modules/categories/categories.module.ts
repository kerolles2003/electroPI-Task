import { Module } from '@nestjs/common';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepository],
  // Exported so the products module can resolve categories by slug/id.
  exports: [CategoryRepository],
})
export class CategoriesModule {}
