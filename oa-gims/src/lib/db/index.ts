import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalPool = globalThis as typeof globalThis & { oaGimsPool?: Pool }

export const pool = globalPool.oaGimsPool ?? new Pool({ connectionString: process.env.DATABASE_URL })

if (process.env.NODE_ENV !== 'production') globalPool.oaGimsPool = pool

export const db = drizzle(pool, { schema })
