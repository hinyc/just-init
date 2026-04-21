import Link from 'next/link'
import { ArrowRight, Database, Layers, Paintbrush, Sparkles, Table2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const stack = [
  {
    icon: Zap,
    title: 'Next.js 16 · App Router',
    desc: 'Turbopack 기본 · Server Components · Cache Components',
  },
  {
    icon: Paintbrush,
    title: 'Tailwind v4 + shadcn/ui',
    desc: 'Radix 베이스 · CSS 변수 테마 · Lucide 아이콘',
  },
  {
    icon: Database,
    title: 'Drizzle ORM',
    desc: 'postgres-js · 타입 안전 · drizzle-kit 마이그레이션',
  },
  {
    icon: Layers,
    title: 'React Query + Zustand',
    desc: '서버 상태는 Query · 클라이언트 상태는 Zustand',
  },
  {
    icon: Table2,
    title: 'TanStack Table 데모',
    desc: 'shadcn Table과 조합된 재사용 DataTable',
  },
  {
    icon: Sparkles,
    title: 'AGENTS.md 첨부',
    desc: 'Claude Code 등 에이전트 규칙 사전 세팅',
  },
]

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-5xl space-y-12">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            just-init · vibe coding boilerplate
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            바로 코딩에 뛰어들 수 있는
            <br className="hidden sm:inline" /> Next.js 스타터
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Tailwind, shadcn/ui (Radix), Lucide, Drizzle, React Query, Zustand, TanStack Table, AGENTS.md까지
            기본 탑재된 보일러플레이트입니다.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/demo">
                데모 보기 <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://nextjs.org/docs" target="_blank" rel="noreferrer">
                Next.js 문서
              </a>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="size-5" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </div>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                src/ 아래에서 바로 사용 가능
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}
