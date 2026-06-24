import { ApiProperty } from '@nestjs/swagger';
import { Locale, Role } from '@prisma/client';

/**
 * Safe public view of a user — never exposes passwordHash or refresh token.
 */
export class UserProfileResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  id!: string;

  @ApiProperty({ example: 'jane@example.com' })
  email!: string;

  @ApiProperty({ example: 'Jane Doe' })
  name!: string;

  @ApiProperty({ enum: Role, example: Role.CUSTOMER })
  role!: Role;

  @ApiProperty({ enum: Locale, example: Locale.EN })
  preferredLocale!: Locale;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  createdAt!: Date;
}
