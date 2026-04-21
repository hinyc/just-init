import { defineConfig } from 'drizzle-kit'
import { loadEnv } from './src/env'

loadEnv()

const url = process.env.DATABASE_URL

if (!url) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.')
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
  strict: true,
  verbose: true,
})
