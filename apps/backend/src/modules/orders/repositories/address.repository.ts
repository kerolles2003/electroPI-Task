import { Injectable } from '@nestjs/common';
import { Address } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Read-only access to Address rows for checkout ownership validation. (Address
 * CRUD is out of scope for this phase; there is no addresses module yet.)
 */
@Injectable()
export class AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Address | null> {
    return this.prisma.address.findUnique({ where: { id } });
  }
}
