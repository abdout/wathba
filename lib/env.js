import { z } from 'zod';

/**
 * Environment variable validation and type-safe access
 */

// Define the schema for environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // App configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_EMAIL: z.string().email().optional(),

  // Database
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string().default('/'),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string().default('/'),
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string().default('/onboarding'),

  // ImageKit CDN
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
  NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),

  // Stripe Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Email Service (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@alwathbacoop.ae'),

  // Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Monitoring (Optional)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Analytics (Optional)
  NEXT_PUBLIC_GOOGLE_ANALYTICS: z.string().optional(),
  NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),

  // Feature Flags
  ENABLE_REVIEWS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_WISHLIST: z.string().transform(val => val === 'true').default('false'),
  ENABLE_CHAT: z.string().transform(val => val === 'true').default('false'),

  // Debug mode
  DEBUG: z.string().transform(val => val === 'true').default('false'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    return { success: true, data: parsed, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter(issue => issue.code === 'invalid_type' && issue.received === 'undefined')
        .map(issue => issue.path.join('.'));

      const invalidVars = error.issues
        .filter(issue => issue.code !== 'invalid_type' || issue.received !== 'undefined')
        .map(issue => `${issue.path.join('.')}: ${issue.message}`);

      return {
        success: false,
        data: null,
        error: {
          missing: missingVars,
          invalid: invalidVars,
          full: error.format()
        }
      };
    }
    return {
      success: false,
      data: null,
      error: { message: 'Unknown error parsing environment variables' }
    };
  }
};

// Create validated env object
const result = parseEnv();

// Export validated environment variables
export const env = result.success ? result.data : {};

// Export validation result for error handling
export const envValidation = result;

// Helper to check if required services are configured
export const services = {
  hasStripe: () => Boolean(env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  hasImageKit: () => Boolean(env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT && env.IMAGEKIT_PRIVATE_KEY),
  hasRedis: () => Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  hasResend: () => Boolean(env.RESEND_API_KEY),
  hasSentry: () => Boolean(env.SENTRY_DSN),
  hasAnalytics: () => Boolean(env.NEXT_PUBLIC_GOOGLE_ANALYTICS || env.NEXT_PUBLIC_MIXPANEL_TOKEN),
};

// Validate environment on startup (only in development)
if (process.env.NODE_ENV === 'development' && !result.success) {
  console.error('⚠️  Environment Variable Validation Failed:');
  if (result.error?.missing?.length > 0) {
    console.error('Missing required variables:', result.error.missing.join(', '));
  }
  if (result.error?.invalid?.length > 0) {
    console.error('Invalid variables:', result.error.invalid.join(', '));
  }
  // Don't throw in development, just warn
  console.warn('Some features may not work correctly without proper environment variables.');
}

export default env;