import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Sole data-access point for the Category table. Owned by the categories module
 * and exported so the products module can resolve categories without re-querying
 * Prisma directly.
 */
@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }
}
