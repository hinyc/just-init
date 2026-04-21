import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/env'
import * as schema from './schema'

const { DATABASE_URL } = env()

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required to initialize the database client.')
}

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>
}

const client =
  globalForDb.client ??
  postgres(DATABASE_URL, {
    max: 1,
    prepare: false,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client
}

export const db = drizzle(client, { schema })
export { schema }
