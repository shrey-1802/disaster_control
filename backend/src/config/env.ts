import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRY: z.coerce.number().default(900), // 15 mins in seconds
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_REFRESH_EXPIRY: z.coerce.number().default(604800), // 7 days in seconds
  CORS_ORIGINS: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
  RATE_LIMIT_TIME_WINDOW: z.coerce.number().default(60000),
  TOMTOM_API_KEY: z.string().default('mock_tomtom_key_for_dev_mode'),
  TOMTOM_BASE_URL: z.string().default('https://api.tomtom.com'),
  TOMTOM_TIMEOUT_MS: z.coerce.number().default(6000)
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Environment configuration validation failed');
  }
  return parsed.data;
}

export const env = loadEnv();
