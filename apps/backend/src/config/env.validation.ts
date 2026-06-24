import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Environment contract. Required values fail fast at boot if missing/invalid.
 * JWT secrets are required: auth is implemented and must never fall back to a
 * hardcoded default. Provider secrets remain optional until their features land.
 */
class EnvironmentVariables {
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  PORT = 3001;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  BCRYPT_ROUNDS = 12;

  @IsString()
  DATABASE_URL!: string;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsIn(['lax', 'strict', 'none'])
  COOKIE_SAMESITE?: 'lax' | 'strict' | 'none';

  @IsOptional()
  @IsString()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_KEY?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_SECRET?: string;

  @IsOptional()
  @IsString()
  STRIPE_SECRET_KEY?: string;

  // Required: webhook signature verification must never silently no-op. Boot
  // fails fast if it is missing so payment confirmations cannot be lost.
  @IsString()
  STRIPE_WEBHOOK_SECRET!: string;

  @IsOptional()
  @IsString()
  RESEND_API_KEY?: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n${errors.toString()}`);
  }

  return validated;
}
