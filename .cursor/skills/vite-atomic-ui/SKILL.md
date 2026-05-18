---
name: vite-atomic-ui
description: >-
  Builds and refactors Vite + React SPA UI using Atomic Design in this repo.
  Uses existing atoms (Button, Input, Card, Tag, TitleBlock, CheckboxSet, Badge)
  and molecules/organisms when composition is needed. Enforces strict TypeScript,
  Tailwind layout, shared typography in src/styles/globals.css, and controlled/uncontrolled
  form rules. Use when adding pages (login, signup, landing), auth forms, tags,
  landing hero, or when the user mentions Atomic Design, atoms, or this project's UI stack.
disable-model-invocation: true
---

# Vite + React Atomic UI (이 프로젝트)

## When to use

- 새 페이지·섹션·폼을 만들거나 기존 마크업을 컴포넌트로 바꿀 때
- 로그인/랜딩/태그 리스트 등 이 레포 패턴을 맞출 때
- 사용자가 Atomic Design, atoms, molecules, organisms, Tailwind, `src/styles/globals.css`를 언급할 때

## Layering (계층)

1. **`src/components/atoms`**: 단일 역할 UI (`Button`, `Input`, `Card`, `Tag`, `TitleBlock`, `CheckboxSet`, `Badge`)
2. **`src/components/molecules`**: atoms 조합 (`TagList` 등)
3. **`src/components/organisms`**: 화면 단위 블록 (`LandingHero`, `AppFooter` 등)
4. **`src/pages/*.tsx`**: 라우트별 페이지 — 데이터·문구 주입과 조립만 두고 반복 UI는 위로 올림

기존 atom이 있으면 **새 마크업보다 확장·재사용**을 우선합니다.

## Atoms — 이 레포에서 쓰는 방식

- **Button**: `variant` (`primary` | `secondary` | `ghost` | `neutral` | `text`), 링크는 `as="a"` + `href`. `type`, `disabled` 등 표준 button props 허용.
- **Input**: `label` + `id`/`name`으로 연결. `value`/`onChange`로 제어 컴포넌트. `error`, `labelClassName` 등으로 확장.
- **CheckboxSet**: 제어 모드는 `checked` + `onChange` **둘 다 필수**. 비제어는 `defaultChecked`만. **동시 사용 금지** (유니온 타입).
- **Tag**: `variant` `stack` | `page` | `default` — 다크 배경 태그는 `stack`/`page`로 대비 유지.
- **TitleBlock**: 공통 타이포는 `app-title` / `app-subtext`; 화면별 색·크기는 `titleClassName`, `subTextClassName`으로 덮어씀.
- **Card**: 카드 컨테이너 한 종류로 통일.

## Styling

- 레이아웃·간격·상호작용: **Tailwind** 클래스.
- 문서 전반 타이포 토큰: **`src/styles/globals.css`**의 `app-title`, `app-subtext`, `app-label`, `app-caption`.
- 다크 배경에서는 텍스트·태그·링크 **대비**를 명시적으로 확인.

## TypeScript and quality

- `strict` 유지. **`any` 지양**.
- 의미 있는 변경 후 **`npm run lint`** 실행; 새로 유입된 이슈는 수정.
- 리팩터 후 **참조 없는 파일·컴포넌트 삭제**.

## React Hooks

- 클라이언트 상태가 필요하면 `useState` / `useCallback` / `useMemo`를 **목적이 있을 때만** 사용.
- 입력은 한 경로에서만 제어 또는 비제어.

## Project rules (Cursor)

- 상세 규칙은 `.cursor/rules/react-components.mdc`, `styling-tailwind.mdc`, `typescript-safety.mdc`를 따름.

## Checklist (새 UI 추가 시)

- [ ] 적절한 레이어(atoms → molecules → organisms)에 배치했는가
- [ ] 기존 `Button` / `Input` / `Tag` / `Card` 등으로 대체 가능한가
- [ ] 폼이 제어/비제어 중 하나로만 동작하는가
- [ ] `globals.css` 토큰과 Tailwind 역할이 섞이지 않았는가
- [ ] 린트 통과 및 미사용 코드 제거
