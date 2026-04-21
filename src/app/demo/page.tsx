import { CounterCard } from './_components/counter-card'
import { UsersTableCard } from './_components/users-table-card'

export default function DemoPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">데모</h1>
        <p className="text-muted-foreground">
          Zustand(route 스토어) + React Query + TanStack Table 조합 예시입니다.
        </p>
      </header>
      <CounterCard />
      <UsersTableCard />
    </main>
  )
}
