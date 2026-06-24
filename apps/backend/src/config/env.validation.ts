import { plainToInstance, Type } from 'class-transformer';
import { IsEmail, IsEnum, IsIn, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

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

  // ── Mail ─────────────────────────────────────────────────────────────────────

  // Active mail provider. Defaults to 'local' (console logger) in non-prod.
  @IsOptional()
  @IsIn(['resend', 'brevo', 'local'])
  MAIL_PROVIDER?: 'resend' | 'brevo' | 'local';

  // Resend credentials
  @IsOptional()
  @IsString()
  RESEND_API_KEY?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  MAIL_FROM?: string;

  // Brevo credentials
  @IsOptional()
  @IsString()
  BREVO_API_KEY?: string;

  @IsOptional()
  @IsString()
  BREVO_SENDER_NAME?: string;

  @IsOptional()
  @IsEmail()
  BREVO_SENDER_EMAIL?: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n${errors.toString()}`);
  }

  // Production safety: the active mail provider must have its credentials present.
  // This catch-at-boot prevents silent mail failures in production environments.
  if (validated.NODE_ENV === NodeEnv.Production) {
    const provider = validated.MAIL_PROVIDER ?? 'local';

    if (provider === 'resend' && !validated.RESEND_API_KEY) {
      throw new Error(
        'RESEND_API_KEY is required when MAIL_PROVIDER=resend in production',
      );
    }

    if (provider === 'brevo' && !validated.BREVO_API_KEY) {
      throw new Error(
        'BREVO_API_KEY is required when MAIL_PROVIDER=brevo in production',
      );
    }

    if (provider === 'local') {
      throw new Error(
        'MAIL_PROVIDER=local is not allowed in production. Set MAIL_PROVIDER to resend or brevo.',
      );
    }
  }

  return validated;
}
