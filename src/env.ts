import { config } from 'dotenv'
import { z } from 'zod'

let loaded = false

/**
 * 로딩 우선순위 (위가 우선):
 *   1. 이미 설정된 process.env (dotenv-cli 로 주입된 값 포함)
 *   2. .env.{mode}.local
 *   3. .env.local
 *   4. .env.{mode}
 *   5. .env
 * Next.js @next/env 와 동일한 규칙.
 */
export function loadEnv(): void {
  if (loaded) return
  const mode = process.env.NODE_ENV ?? 'development'
  config({ path: `.env.${mode}.local`, override: false })
  config({ path: '.env.local', override: false })
  config({ path: `.env.${mode}`, override: false })
  config({ path: '.env', override: false })
  loaded = true
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_API_BASE_URL: z.string().min(1).default('/api'),
  DATABASE_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof EnvSchema>

let cached: Env | null = null

export function env(): Env {
  if (cached) return cached
  loadEnv()
  const parsed = EnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  cached = parsed.data
  return cached
}
