import {
  DEFAULT_STRIPE_CANCEL_PATH,
  DEFAULT_STRIPE_SUCCESS_PATH,
} from '../modules/payments/constants/payment.constant';

/**
 * Typed configuration loader.
 * Values are validated separately in `env.validation.ts`.
 */
const ACCESS_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default () => {
  const isProduction = (process.env.NODE_ENV ?? 'development') === 'production';
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: process.env.PORT ? Number(process.env.PORT) : 3001,
    frontendUrl: process.env.FRONTEND_URL,
    database: {
      url: process.env.DATABASE_URL,
    },
    auth: {
      // Validated as required in env.validation.ts — no insecure fallback here.
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
      refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
      // bcrypt work factor — tune per environment (lower in tests to keep them fast).
      bcryptRounds: process.env.BCRYPT_ROUNDS ? Number(process.env.BCRYPT_ROUNDS) : 12,
    },
    cookies: {
      secure: isProduction,
      // Use 'none' (with secure cookies) for cross-origin frontends; defaults to 'lax'.
      sameSite: (process.env.COOKIE_SAMESITE ?? 'lax') as 'lax' | 'strict' | 'none',
      accessMaxAgeMs: ACCESS_TTL_MS,
      refreshMaxAgeMs: REFRESH_TTL_MS,
    },
    storage: {
      // Cloudinary credentials for the active StorageProvider. Required only when
      // an upload actually runs (validated lazily in CloudinaryStorageProvider).
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
    },
    payment: {
      // Stripe credentials for the active online PaymentProvider. Required only
      // when an ONLINE checkout/webhook actually runs (validated lazily).
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        successUrl: process.env.STRIPE_SUCCESS_URL ?? `${frontendUrl}${DEFAULT_STRIPE_SUCCESS_PATH}`,
        cancelUrl: process.env.STRIPE_CANCEL_URL ?? `${frontendUrl}${DEFAULT_STRIPE_CANCEL_PATH}`,
      },
    },
  };
};
