'use client'

import { Minus, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDemoStore } from '../_store'

export function CounterCard() {
  const count = useDemoStore((s) => s.count)
  const increment = useDemoStore((s) => s.increment)
  const decrement = useDemoStore((s) => s.decrement)
  const reset = useDemoStore((s) => s.reset)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zustand 카운터</CardTitle>
        <CardDescription>route 전용 전역 상태 — `_store.ts`</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <div className="tabular-nums text-3xl font-semibold">{count}</div>
        <Button onClick={increment} size="icon" variant="outline" aria-label="증가">
          <Plus className="size-4" />
        </Button>
        <Button onClick={decrement} size="icon" variant="outline" aria-label="감소">
          <Minus className="size-4" />
        </Button>
        <Button onClick={reset} size="icon" variant="ghost" aria-label="리셋">
          <RotateCcw className="size-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
