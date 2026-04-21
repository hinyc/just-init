import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http/instance'
import type { DemoUser } from '@/app/api/demo/users/schema'

export type { DemoUser }

export function useDemoUsers() {
  return useQuery({
    queryKey: ['demo', 'users'],
    queryFn: () => http.get<DemoUser[]>('/demo/users'),
  })
}
