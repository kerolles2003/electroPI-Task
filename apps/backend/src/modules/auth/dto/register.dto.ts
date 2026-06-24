import { ApiProperty } from '@nestjs/swagger';
import { Locale } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Doe', minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email!: string;

  // bcrypt only hashes the first 72 bytes — cap length to make that explicit.
  @ApiProperty({ example: 'P@ssw0rd123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ enum: Locale, example: Locale.EN })
  @IsEnum(Locale)
  preferredLocale!: Locale;
}
