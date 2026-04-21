# just-init

바이브 코딩용 Next.js 보일러플레이트. 새 프로젝트를 시작하면서 매번 반복하던 셋업(Tailwind, shadcn, DB, 상태관리, 에이전트 설정)을 미리 해둔 스타터입니다.

## 포함된 스택

- **Next.js 16** · App Router · Turbopack · React 19
- **Tailwind CSS v4** (CSS-first config)
- **shadcn/ui** (Radix 베이스, `neutral` 팔레트) · **lucide-react**
- **Drizzle ORM** + `postgres-js` · `drizzle-kit`
- **React Query** (+ Devtools) · **Zustand**
- **TanStack Table** 기반 재사용 `DataTable` 컴포넌트
- **zod** + **dotenv**로 환경변수 검증 (`src/env.ts`)
- **AGENTS.md** — 에이전트/사람 공용 프로젝트 가이드

## 새 프로젝트 시작하기 (템플릿으로 사용)

이 저장소는 **GitHub Template repository** 로 사용하도록 만들어졌습니다. 두 가지 방법 중 편한 쪽을 고르세요.

### 방법 1 — degit (권장, git 이력 없이 스냅샷만)

```bash
pnpm dlx degit <owner>/just-init my-app
cd my-app
cp .env.example .env.local
pnpm install
pnpm dev
```

### 방법 2 — GitHub "Use this template" 버튼

1. 저장소 페이지에서 **Use this template → Create a new repository** 클릭
2. 새 레포를 clone 후:

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열고 `/demo` 에서 React Query + Zustand + DataTable 예제를 확인할 수 있습니다.

> 템플릿으로 사용하려면 GitHub 저장소 Settings → General → 상단의 **"Template repository"** 체크박스를 활성화하세요.

## 환경변수 파일

| 파일 | 용도 | 커밋 |
| --- | --- | --- |
| `.env.development` | 개발 공용 기본값 | ✅ |
| `.env.production` | 프로덕션 공용 기본값 | ✅ |
| `.env.local` | 개인 시크릿/오버라이드 | ❌ |
| `.env.example` | `.env.local` 템플릿 | ✅ |

`.env.local` 이 항상 최우선으로 적용됩니다.

## 자주 쓰는 명령

```bash
# 개발
pnpm dev          # dev env 로 next dev
pnpm dev:prod     # prod env 로 next dev (프로덕션 설정 리허설)
pnpm dev:local    # .env.local 만 로드

# 빌드
pnpm build        # prod env 로 next build (기본 프로덕션 빌드)
pnpm build:dev    # dev env 로 next build (스테이징 번들)
pnpm build:local  # .env.local 만으로 빌드

# 서버 (빌드된 파일을 서빙. NEXT_PUBLIC_* 는 빌드 시점에 이미 인라인됨)
pnpm start        # next start — .env.production 자동 로드

# 품질
pnpm typecheck
pnpm lint

# shadcn 컴포넌트 추가
pnpm dlx shadcn@latest add <name>

# Drizzle (dev env 기준)
pnpm db:generate  # 마이그레이션 생성
pnpm db:migrate   # 마이그레이션 적용
pnpm db:push      # 스키마 직접 푸시
pnpm db:studio    # Drizzle Studio

# 의존성 업데이트
pnpm deps:check           # 구버전 패키지 목록 (pnpm outdated)
pnpm deps:update          # semver 범위 내에서 업데이트 (pnpm update)
pnpm deps:update:latest   # 메이저 포함 최신으로 (pnpm update --latest) · 주의
```

## 구조

- `src/app` — App Router
- `src/components/ui` — shadcn 컴포넌트 (`data-table.tsx` 포함)
- `src/components/providers.tsx` — React Query Provider
- `src/db` — Drizzle 클라이언트·스키마
- `src/stores` — Zustand 스토어
- `src/env.ts` — 환경변수 로딩/검증

프로젝트 규칙과 에이전트 지침은 [`AGENTS.md`](./AGENTS.md)를 참고하세요.
