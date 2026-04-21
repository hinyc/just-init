'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { demoUserColumns } from '../_columns'
import { useDemoUsers } from '../_hooks/use-demo-users'

export function UsersTableCard() {
  const { data, isFetching, refetch } = useDemoUsers()

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>React Query로 로드, TanStack Table + shadcn으로 렌더</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={demoUserColumns}
          data={data ?? []}
          searchKey="name"
          searchPlaceholder="이름으로 검색…"
          pageSize={5}
        />
      </CardContent>
    </Card>
  )
}
