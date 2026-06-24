import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { ProductListFilter } from '../interfaces/product-list-filter.interface';

// Product with its owning category always eagerly loaded.
export type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

export interface PaginatedProducts {
  items: ProductWithCategory[];
  total: number;
}

const INCLUDE_CATEGORY = { category: true } as const;

/**
 * Sole data-access point for the Product table.
 */
@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<ProductWithCategory | null> {
    return this.prisma.product.findUnique({ where: { id }, include: INCLUDE_CATEGORY });
  }

  findBySlug(slug: string): Promise<ProductWithCategory | null> {
    return this.prisma.product.findUnique({ where: { slug }, include: INCLUDE_CATEGORY });
  }

  create(data: Prisma.ProductCreateInput): Promise<ProductWithCategory> {
    return this.prisma.product.create({ data, include: INCLUDE_CATEGORY });
  }

  update(id: string, data: Prisma.ProductUpdateInput): Promise<ProductWithCategory> {
    return this.prisma.product.update({ where: { id }, data, include: INCLUDE_CATEGORY });
  }

  delete(id: string): Promise<ProductWithCategory> {
    return this.prisma.product.delete({ where: { id }, include: INCLUDE_CATEGORY });
  }

  /**
   * Returns one page of products plus the total count for the same filter,
   * computed atomically in a single transaction.
   */
  async findManyPaginated(filter: ProductListFilter): Promise<PaginatedProducts> {
    const where = this.buildWhere(filter);
    const skip = (filter.page - 1) * filter.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: INCLUDE_CATEGORY,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filter.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  private buildWhere(filter: ProductListFilter): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (typeof filter.isAvailable === 'boolean') {
      where.isAvailable = filter.isAvailable;
    }

    if (filter.search) {
      where.OR = [
        { nameEn: { contains: filter.search, mode: 'insensitive' } },
        { nameAr: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
