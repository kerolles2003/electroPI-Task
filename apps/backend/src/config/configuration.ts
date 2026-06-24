/**
 * Typed configuration loader.
 * Values are validated separately in `env.validation.ts`.
 */
export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
});
