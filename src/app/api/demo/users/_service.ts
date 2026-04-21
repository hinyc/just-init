import 'server-only'
import type { DemoUser } from './schema'

/**
 * BFF 서비스 레이어.
 * 실제 구현은 아래 중 하나로 교체:
 *   1) DB 쿼리
 *        import { db, schema } from '@/db'
 *        const rows = await db.select().from(schema.users)
 *        return rows.map(toDemoUser)
 *   2) 외부 API 호출
 *        import { http } from '@/lib/http'
 *        const external = await http.get<ExternalUser[]>('https://api.example.com/users')
 *        return external.map(toDemoUser)
 *
 * 어떤 소스를 쓰든 BFF 응답은 **프론트 필요 shape** 으로 변환해서 반환한다.
 */

const mockUsers: DemoUser[] = [
  { id: 1, name: '김코딩', email: 'code@example.com', role: 'admin' },
  { id: 2, name: '이디자인', email: 'design@example.com', role: 'member' },
  { id: 3, name: '박프로덕트', email: 'product@example.com', role: 'member' },
  { id: 4, name: '최게스트', email: 'guest@example.com', role: 'guest' },
  { id: 5, name: '정풀스택', email: 'full@example.com', role: 'admin' },
]

export async function getDemoUsers(): Promise<DemoUser[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockUsers
}
