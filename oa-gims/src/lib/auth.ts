import { betterAuth } from 'better-auth'
import { pool } from './db'

const runtimeBaseUrl = process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL)

const developmentOrigins = process.env.NODE_ENV === 'development'
  ? [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.V0_RUNTIME_URL,
      process.env.V0_DEV_APP_URL,
      process.env.V0_BUILD_URL,
      process.env.V0_SANDBOX_URL,
    ].filter((origin): origin is string => Boolean(origin))
  : []

const productionOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
      .filter((host): host is string => Boolean(host))
      .map((host) => `https://${host}`)
  : []

export const auth = betterAuth({
  database: pool,
  baseURL: runtimeBaseUrl,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'MEMBER', input: false },
      employeeId: { type: 'string', required: false, input: false },
    },
  },
  trustedOrigins: [...developmentOrigins, ...productionOrigins],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
