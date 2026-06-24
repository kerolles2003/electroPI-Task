import { ApiProperty } from '@nestjs/swagger';
import { Locale } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Full display name (2–120 characters)', minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Must be unique — registration fails if the address is already in use' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'P@ssw0rd123', description: 'Minimum 8 characters. bcrypt only processes the first 72 bytes.', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ enum: Locale, example: Locale.EN, description: 'Preferred language for emails and UI' })
  @IsEnum(Locale)
  preferredLocale!: Locale;
}
