# AGENTS.md

이 문서는 이 저장소에서 작업하는 모든 코딩 에이전트(Claude Code, Codex, Cursor, Aider 등)와 개발자를 위한 공용 가이드입니다.

## 프로젝트 개요

"just-init" — 바이브 코딩(빠르고 즉흥적인 프로토타이핑)을 위한 Next.js 보일러플레이트.
새 기능을 붙여 바로 실험할 수 있도록 스택과 관례가 미리 세팅되어 있습니다.

## 기술 스택

| 영역 | 기본값 |
| --- | --- |
| 런타임 / 프레임워크 | Next.js 16 (App Router, Turbopack) · React 19 |
| 스타일 | Tailwind CSS v4 (CSS-first config) |
| UI 키트 | shadcn/ui (Radix 베이스, `neutral` 팔레트) |
| 아이콘 | lucide-react |
| 서버 상태 | @tanstack/react-query + devtools |
| 클라이언트 상태 | zustand |
| 데이터 테이블 | @tanstack/react-table + shadcn Table → `components/ui/data-table.tsx` |
| HTTP | `src/lib/http` (fetch 기반, axios-like, 인터셉터 지원) |
| ORM / DB | drizzle-orm + postgres-js · drizzle-kit |
| 스키마 검증 | zod |
| 환경변수 | dotenv + `src/env.ts` 검증 |

## 디렉터리 — 코로케이션(colocation) 원칙

**route에서만 쓰는 코드는 route 폴더 안에 `_` prefix로 둔다.**
Next.js App Router에서 `_`로 시작하는 폴더는 라우트로 노출되지 않는 **private folder**입니다.

```
src/
  app/
    layout.tsx                 # Providers 주입
    page.tsx                   # 랜딩
    api/                       # ★ BFF 엔드포인트 전용 폴더
      demo/
        users/
          route.ts             # 얇은 HTTP 핸들러
          _service.ts          # DB/외부 API 호출 + shape 변환 (server-only)
          schema.ts            # 요청/응답 zod 스키마 + 타입(공용)
    demo/                      # /demo 라우트
      page.tsx                 # 조립만. 150줄 제한 엄수
      _components/             # 이 라우트 전용 컴포넌트
        counter-card.tsx
        users-table-card.tsx
      _hooks/                  # 이 라우트 전용 훅
        use-demo-users.ts      # http.get('/demo/users') — BFF 경유
      _columns.tsx             # 테이블 컬럼 정의
      _store.ts                # ★ route 전용 zustand 스토어
  components/
    ui/                        # shadcn 기본 컴포넌트(전역 재사용)
    providers.tsx              # QueryClientProvider 등 글로벌 Provider
  stores/                      # ★ 전역(global) zustand 스토어만
    ui-store.ts
  lib/
    http/                      # fetch 기반 HTTP 클라이언트 (배럴 없음)
      client.ts                # HttpClient 클래스
      errors.ts                # HttpError / NetworkError / TimeoutError
      instance.ts              # 기본 http 인스턴스 + 인터셉터 초기화
    utils.ts
  db/
    index.ts
    schema.ts
  env.ts                       # dotenv + zod
drizzle.config.ts
```

규칙:
- 두 개 이상의 route에서 공유되는 컴포넌트/훅/타입만 `src/components`, `src/hooks`, `src/lib`로 올린다.
- 특정 route에만 쓰이는 것은 **반드시** 해당 route의 `_components` / `_hooks` / `_store.ts` 등에 둔다.
- 같은 폴더 안에서는 상대경로(`./_hooks/...`)로 import, 다른 영역은 `@/` 절대경로.

## 컴포넌트 작성 규칙

1. **한 컴포넌트는 150줄을 넘기지 않는다.** 초과되면 작은 컴포넌트로 쪼갠다.
2. **함수(특히 JSX 외 로직)가 길어지면 훅으로 추출한다.** `_hooks/use-*.ts` 파일로 분리해 컴포넌트는 표현(render)에 집중.
3. 함수 하나 50줄 이내, 중첩 4레벨 이내.
4. 서버 컴포넌트가 기본. 상호작용·브라우저 API가 필요할 때만 파일 최상단에 `'use client'`.
5. 컴포넌트 파일은 기본 export가 아닌 **named export**를 선호 (page.tsx 등 Next 컨벤션 파일 제외).
6. 주석은 "왜"가 비자명할 때만. "무엇"은 이름으로 드러낸다.

## 타입 관리 규칙

타입은 **사용처 옆 → 도메인 파일 → 공용** 순서로 둔다. 중복을 없애면서도 한 파일이 비대해지지 않도록 한다.

### 어디에 두는가

1. **기본은 코로케이션**: 컴포넌트 props·내부 타입은 해당 파일 안에서 바로 정의.
2. **도메인 계약(contract)은 전용 파일**:
   - BFF 요청/응답 → `src/app/api/<r>/schema.ts` (zod + `z.infer<>`)
   - DB row/enum → `src/db/schema.ts` (drizzle `$inferSelect` / `$inferInsert`)
   - 같은 route 안에서 2+ 파일이 공유 → 해당 route의 `_types.ts`
   - 여러 route 에서 공유 → `src/types/<domain>.ts` (도메인별 파일)
3. **2회 룰**: 같은 타입이 **실제로 2 곳 이상**에서 쓰일 때만 상위로 승격한다. 한 번만 쓰이면 사용처 옆 유지.
4. **`src/types/index.ts` 같은 god-file 금지**. 도메인별로 `user.ts`, `order.ts` 처럼 분할.

### 어떻게 정의하는가

1. **가능하면 zod 스키마에서 파생**: `export type X = z.infer<typeof XSchema>`. 런타임 검증 + 컴파일 타입을 한 소스에서 얻어 drift 방지.
2. **DB 타입은 drizzle 추론 사용**: `typeof users.$inferSelect` / `$inferInsert`.
3. **Type-only import 강제**: 다른 파일의 타입만 가져올 때는 `import type { X } from ...`. 특히 서버 전용 파일(`_service.ts`)의 타입을 클라이언트 훅에서 참조할 때.
4. **공용 타입 파일에는 타입·zod 스키마만**. 실행 로직·인스턴스·부작용 금지 (순환 import 방지).
5. **enum 은 zod `z.enum([...])` 기반으로** 통일 — TS enum 키워드는 쓰지 않는다(번들 크기·호환성).

### 중복을 발견하면

- 실제로 같은 개념 → 2회 룰에 따라 상위로 승격.
- 이름만 같고 다른 도메인 → 유지. 경계를 흐리는 강제 통합은 하지 않는다.
- 새 타입 만들기 전에 `schema.ts` / `src/db/schema.ts` / `src/types/` 를 먼저 grep.

## 배럴 파일 금지

**`index.ts` 로 하위 파일들을 re-export 하는 배럴 패턴을 만들지 않는다.**

- 이유: 트리 셰이킹 방해, 콜드 빌드 지연, 순환 import 위험, 실제 의존 관계가 숨는다.
- 규칙:
  - 폴더 단위 `index.ts` re-export 파일을 새로 만들지 않는다.
  - 소비자는 **구체 파일 경로** 로 import 한다.
  - 초기화·인스턴스 생성이 필요한 경우(`http` 처럼)에는 용도를 드러내는 파일명을 쓴다(예: `instance.ts`). re-export 용 `index.ts` 가 아니다.
- 예시

```ts
// ❌ 배럴 (금지)
// src/lib/http/index.ts
export * from './client'
export * from './errors'
// 사용처: import { http, HttpClient, HttpError } from '@/lib/http'

// ✅ 명시적 경로
import { http } from '@/lib/http/instance'
import { HttpClient } from '@/lib/http/client'
import { HttpError } from '@/lib/http/errors'
```

- shadcn `ui/*` 컴포넌트, store, 훅 모두 동일하게 **파일 단위로 직접 import**.

## Props drilling 금지 (중요)

- **props는 자식 한 단계까지만 내린다.**
- 손자 이상으로 전달이 필요하면 **전역 상태**로 승격한다.
- 승격 기준:
  - route 안에서만 공유되는 상태 → 해당 route의 `_store.ts` (zustand)
  - 여러 route에서 공유되는 상태 → `src/stores/*` (zustand, 예: `ui-store.ts`)
  - 서버 데이터 → React Query (`useQuery` / `useMutation`)로 관리. 전역 상태에 중복 저장하지 않는다.
- 공유가 필요한 UI 컨텍스트(예: 폼, 복잡 위젯 내부)는 작은 스코프의 **Context + useReducer** 또는 **Compound Component 패턴**도 허용. 이 경우 스코프를 해당 컴포넌트 트리로 한정.

## 전역 상태 분리 규칙

| 종류 | 위치 | 예 |
| --- | --- | --- |
| **Global** (앱 전역) | `src/stores/<name>-store.ts` | `useUIStore` (사이드바/커맨드 팔레트) |
| **Route-scoped** | `src/app/<route>/_store.ts` | `useDemoStore` |
| **Server state** | React Query (store에 복제 금지) | `useDemoUsers` |
| **Form state** | 컴포넌트 local + zod 검증 | |

zustand 스토어는 항상:
- `devtools` 미들웨어로 감싸 DevTools에서 이름으로 식별.
- 액션 이름을 `'<scope>/<action>'` 형식으로(`'demo/increment'`) 남긴다.
- 셀렉터로 읽어 리렌더링 최소화 (`useStore((s) => s.x)`).

## BFF 패턴 (중요)

이 프로젝트의 API는 **Backend-for-Frontend** 패턴을 따른다. 프론트엔드는 외부 서비스와 직접 대화하지 않고, 항상 **우리 BFF(`src/app/api/*`)를 통해서만** 통신한다.

### 경계

- **브라우저(클라이언트 컴포넌트/훅)** → **`/api/*`** → (BFF 내부) → **DB / 외부 API**
- 브라우저에서 외부 API를 직접 호출하지 않는다. (CORS·시크릿·버전 락-인 때문에)
- `app/api/*` 안에서는 DB 쿼리를 날리거나 외부 API를 호출하거나 둘 다 조합해도 된다.
- **서버 컴포넌트 / 서버 액션이 자기 BFF 데이터가 필요한 경우:**
  - ✅ 권장: `_service.ts` 의 함수를 **직접 import** 해서 호출한다.
    ```ts
    // app/some/page.tsx (server component)
    import { getDemoUsers } from '@/app/api/demo/users/_service'
    const users = await getDemoUsers()
    ```
  - ❌ 금지: `fetch('/api/demo/users')` 같은 자기 자신으로의 HTTP 왕복.
  - 이유: 같은 프로세스면 HTTP 라운드트립이 불필요한 직렬화·네트워크·재검증 오버헤드다. 직접 호출이 타입 안전하고 빠르며 에러 추적도 쉽다.
  - 브라우저 측은 반대로 **반드시** `http` 클라이언트로 `/api/*` 를 호출한다 (서비스 함수 직접 import 금지 — server-only).

### 라우트 파일 구성

BFF 라우트 폴더는 세 파일로 구성한다:

```
src/app/api/<resource>/
  route.ts       # HTTP 핸들러. 입력 파싱·검증·인증·응답 직렬화만.
  _service.ts    # 서버 전용 로직. DB/외부 API 호출, 변환.
  schema.ts      # zod 스키마 + 타입. 클라이언트 훅도 여기서 type import.
```

- **`route.ts`** 는 얇게 유지한다. 기본적으로 50줄 이내. 비즈니스 로직을 넣지 않는다.
- **`_service.ts`** 는 `import 'server-only'` 로 보호하고, 함수 단위로 export.
- **`schema.ts`** 는 공용 계약(contract). 클라이언트 훅에서 `import type { ... } from '@/app/api/<resource>/schema'` 로 타입만 가져와 사용.
- 여러 라우트가 공유하는 서비스 (예: 외부 API 클라이언트, 공용 도메인 로직)는 `src/server/<domain>/...` 또는 `src/lib/...` 로 승격.

### 응답 계약

- BFF 응답은 항상 **프론트가 필요한 shape** 으로 변환해서 반환한다. raw DB row 나 외부 API 원문을 그대로 노출 금지.
- 응답은 `DemoUsersResponseSchema.parse()` 처럼 zod 로 한 번 **검증한 뒤** 반환해 계약 drift 를 방지한다.
- 에러 응답은 `{ error: string, code?: string }` 형식을 기본으로. HTTP status 코드로 의미를 표현하고 `HttpError` 가 자동으로 파싱한다.
- 성공 body 에는 메타(페이지네이션 등)가 필요하면 `{ data, meta }` 래핑을 사용.

### 클라이언트 훅

- 프론트는 `http.get/post/...` 로 **BFF 상대경로**(`/demo/users`) 만 호출한다. base URL 은 `NEXT_PUBLIC_API_BASE_URL` 가 담당.
- `useQuery` / `useMutation` 의 `queryKey` 는 `[resource, ...params]` 형식.
- 훅은 `schema.ts` 에서 type-only import 하여 응답 타입을 공유.

### 해서는 안 되는 것

- 컴포넌트/훅에서 외부 API 도메인을 직접 fetch 하지 않기.
- `app/api/*` 외부(예: Server Component)에서 외부 API 를 직접 호출해도 되지만, 재사용 가능한 로직이면 서비스 레이어로 옮긴다.
- 라우트 핸들러에서 DB 쿼리·외부 API 호출 코드를 인라인 작성하지 않기 — 반드시 `_service.ts` 로 분리.
- 클라이언트 훅 파일에서 `_service.ts` 를 import 하지 않기 (server-only).

## HTTP 클라이언트 규칙

브라우저 측의 모든 HTTP 호출은 `src/lib/http`의 `http` 인스턴스를 통한다. `fetch`를 직접 쓰지 않는다. 대상은 **BFF(`/api/*`)** 이다.

```ts
import { http } from '@/lib/http/instance'
import { HttpError } from '@/lib/http/errors'

// 기본 사용 — baseUrl 은 NEXT_PUBLIC_API_BASE_URL (기본 '/api')
const users = await http.get<User[]>('/users')           // → /api/users
await http.post<User>('/users', { name: 'Ada' })          // → /api/users
await http.get<User[]>('/users', { params: { q: 'ada', page: 1 } })

// 에러 처리
try {
  await http.get('/me')
} catch (err) {
  if (err instanceof HttpError && err.status === 404) { /* ... */ }
}
```

- `http.useRequest / useResponse / useError`로 전역 인터셉터 등록 — 인증 토큰 주입, 401 리다이렉트 등은 `src/lib/http/index.ts`에서 설정.
- 외부 API 를 서버에서 직접 호출할 때는 `import { HttpClient } from '@/lib/http/client'` 로 가져와 `new HttpClient({ baseUrl: 'https://api.example.com', defaultHeaders: { ... } })` 로 별도 인스턴스를 만들어 `_service.ts` 안에서만 사용.
- React Query와 조합: `queryFn: () => http.get<T>('/...')`.
- FormData/Blob/string은 자동 감지해 그대로 전송. 그 외 객체는 JSON 직렬화.
- `timeout` 옵션으로 `TimeoutError`를 명시적으로 던질 수 있다.

## 명령어

개발·빌드는 타깃 환경별로 스크립트가 분리되어 있습니다. 모든 스크립트는 `dotenv-cli`로 명시적으로 env 파일을 읽습니다.

| 목적 | 명령 | 로드되는 env 파일 |
| --- | --- | --- |
| 개발(기본, dev env) | `pnpm dev` | `.env.local` → `.env.development` |
| 개발(prod env) | `pnpm dev:prod` | `.env.local` → `.env.production` |
| 개발(로컬만) | `pnpm dev:local` | `.env.local` |
| 프로덕션 빌드 | `pnpm build` | `.env.local` → `.env.production` |
| 스테이징 빌드(dev env) | `pnpm build:dev` | `.env.local` → `.env.development` |
| 로컬 빌드 | `pnpm build:local` | `.env.local` |
| 프로덕션 서버 시작 | `pnpm start` | Next.js 기본 (`.env.production` + `.env.local`) |
| 타입 체크 | `pnpm typecheck` | — |
| Lint | `pnpm lint` | — |
| shadcn 컴포넌트 추가 | `pnpm dlx shadcn@latest add <name>` | — |
| Drizzle 마이그레이션 생성 | `pnpm db:generate` | `.env.local` → `.env.development` |
| Drizzle 마이그레이션 적용 | `pnpm db:migrate` | `.env.local` → `.env.development` |
| 스키마 직접 푸시 (dev 전용) | `pnpm db:push` | `.env.local` → `.env.development` |
| Drizzle Studio | `pnpm db:studio` | `.env.local` → `.env.development` |
| 의존성 outdated 확인 | `pnpm deps:check` | — |
| 의존성 업데이트 (semver 내) | `pnpm deps:update` | — |
| 의존성 업데이트 (메이저 포함) | `pnpm deps:update:latest` | — |

> `dotenv -e A -e B` 는 **먼저 나열된 파일이 우선**입니다. 따라서 `.env.local`이 항상 `.env.development` / `.env.production` 보다 우선 적용됩니다.
>
> `start` 는 분리하지 않습니다. `next start` 는 이미 빌드된 `.next/` 를 서빙하며 `NEXT_PUBLIC_*` 는 **빌드 시점에 인라인**되므로 start 단계에서 env 를 바꿔도 번들에 반영되지 않습니다. 서버 런타임 변수는 빌드와 같은 프로파일(기본: `.env.production`)을 쓰는 것이 옳습니다.

## 환경변수

**3-파일 전략**:

| 파일 | 용도 | 커밋 |
| --- | --- | --- |
| `.env.development` | 개발 공용 설정 (API 주소, 로컬 DB 기본값 등) | ✅ (비밀값 금지) |
| `.env.production` | 프로덕션 공용 설정 (배포 URL 등) | ✅ (비밀값 금지, 실제 값은 호스트 대시보드로) |
| `.env.local` | 개인/머신별 비밀값·오버라이드 | ❌ gitignored |
| `.env.example` | `.env.local` 템플릿 | ✅ |

적용 순서 (위가 우선):

1. 이미 설정된 `process.env` (CI 변수 등)
2. `dotenv-cli -e .env.local` (스크립트에서 최우선 지정)
3. `dotenv-cli -e .env.{mode}` (해당 스크립트의 대상 환경)
4. `src/env.ts` 의 `loadEnv()` 가 서버 측 유틸(drizzle-kit 등)에서 위 순서를 재확인

`src/env.ts` 의 zod 스키마에 새 변수를 반드시 추가해 타입 안전하게 읽습니다. 브라우저 노출이 필요한 값만 `NEXT_PUBLIC_` 프리픽스 (예: `NEXT_PUBLIC_API_BASE_URL`).

서버 전용 모듈(`src/db/index.ts` 등)은 `import 'server-only'` 를 유지합니다.

**사용 예**:

- 처음 시작: `cp .env.example .env.local` → 비밀값 채움 → `pnpm dev`
- 프로덕션 빌드 로컬 리허설: `pnpm dev:prod`
- 스테이징 배포 번들 생성: `pnpm build:dev`

## 에이전트 작업 순서 (권장)

1. `AGENTS.md`와 해당 route의 `_*` 파일을 먼저 읽어 현재 구조를 파악.
2. 새 기능의 범위에 맞게 둘 위치 결정 (route-local vs 공용).
3. DB 변경이 필요하면 `src/db/schema.ts` 수정 → `pnpm db:generate` → `pnpm db:migrate`.
4. 서버 데이터는 Route Handler / Server Action으로 노출 → `http` 클라이언트 + React Query로 소비.
5. 컴포넌트는 shadcn `ui/*`를 조합해 작성, 150줄 넘기 전에 분리.
6. 작업 후 `pnpm typecheck && pnpm lint && pnpm build` 통과 확인.
7. 사용자가 명시적으로 요청하지 않는 한 새 `.md` 파일(README 외)을 만들지 않는다.

## 하지 말아야 할 것

- `.env`, 비밀키, 실제 DB URL 커밋 금지.
- shadcn `ui/*` 파일을 직접 고치지 말고 래퍼 컴포넌트를 새로 만든다.
- Tailwind `tailwind.config.*`를 되살리지 않기 (v4는 CSS-first).
- `any`, 무분별한 `// eslint-disable`, `try/catch` 삼키기 지양.
- `fetch`를 컴포넌트/훅에서 직접 호출하지 않기 — 항상 `http` 사용.
- 브라우저에서 외부 API 를 직접 호출하지 않기 — 반드시 `/api/*` BFF 를 경유.
- 라우트 핸들러(`route.ts`)에 비즈니스 로직·DB 쿼리·외부 API 호출을 인라인 작성하지 않기 — `_service.ts` 로 분리.
- 서버 컴포넌트/서버 액션이 자기 `/api/*` 를 HTTP 로 재호출하지 않기. 같은 프로세스이므로 `_service.ts` 의 함수를 직접 import 해서 사용한다.
- 배럴 `index.ts` 를 만들지 않기. 소비자는 `@/lib/http/instance` 처럼 구체 파일 경로로 import.
- `src/types/index.ts` god-file 만들지 않기. 도메인별 파일로 쪼갠다.
- 손자 컴포넌트까지 props로 데이터 내리지 않기 — 스토어로 승격.
- route 전용 스토어를 `src/stores`에 두지 않기 — `_store.ts`로 옮긴다.
- 서버 전용 코드를 클라이언트 번들로 끌어들이지 않기 (`server-only` 유지).

## 새 종속성 추가 규칙

- 이미 있는 도구(zod, React Query, zustand, drizzle, http client)로 해결 가능한지 먼저 확인.
- 추가 시 본 문서의 "기술 스택" 표도 함께 갱신.
- 패키지 업데이트는 `pnpm deps:check` → `pnpm deps:update` 로 점진 적용. 메이저 버전업(`deps:update:latest`) 후에는 반드시 `pnpm typecheck && pnpm build` 로 깨진 곳을 확인한다.

## 템플릿 유지보수 (just-init 관리자용)

이 저장소 자체가 템플릿입니다. 새 프로젝트의 출발점이 되므로 다음을 지킵니다.

- **GitHub Settings → General → Template repository** 체크를 유지해 `Use this template` 버튼이 노출되도록 한다.
- `main` 브랜치에 빌드 가능한 상태만 머지 — `pnpm typecheck && pnpm lint && pnpm build` 3 명령이 모두 초록이어야 한다.
- 스택 버전 업그레이드는 별도 PR 로 분리해 사용자가 차이를 따라가기 쉽게 한다.
- 템플릿 경로(`hinyc/just-init`)를 바꿀 일이 있으면 `README.md` 의 degit 예시와 Use-this-template 링크를 같이 갱신한다.
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
