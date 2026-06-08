# Engineering Guardrails & Harness Review Checklist

이 문서는 엔지니어링 규칙·스킬·검수 체크리스트의 **단일 기준(source of truth)** 입니다.
`.cursor/rules/engineering-guardrails.mdc`는 이 문서를 항상 참조하도록 연결되어 있습니다.

또한 “하네스 규칙(검수 항목)”을 반드시 수행해야 `완료(merge-ready)`로 간주되도록 체크리스트를 제공합니다.

## 1) Integrated Cursor Rules (요약/통합)

### TypeScript Safety

- 프로젝트의 strict TypeScript 설정과 호환되게 작성합니다.
- `any`는 최대한 피하고, 명시적 인터페이스/유니온/유틸리티 타입을 우선합니다.
- ESLint 및 React Hooks 규칙을 준수하며, 근거 없는 경고 억제를 하지 않습니다.
- Prettier 설정을 따릅니다(`single quotes`, `no semicolons`, `trailing commas`, `print width 100`).
- 의미 있는 수정 후 lint를 실행하고 변경으로 유입된 이슈를 해결합니다.
- 리팩터링으로 생긴 미사용 코드/파일은 정리합니다.

### Styling (Tailwind + globals.css)

- 컴포넌트 레벨 레이아웃/간격/상호작용 상태는 Tailwind 유틸리티 클래스를 사용합니다.
- 공통 타이포/의미 기반 스타일은 `src/styles/globals.css`에 재사용 클래스로 둡니다.
- 공통 클래스는 `app-title`, `app-subtext`처럼 토큰형 네이밍을 선호합니다.
- 다크 배경에서 접근 가능한 대비를 보장합니다.
- 가독성을 해치는 중복/충돌 클래스 스택은 피합니다.
- 전역 변경이 아닌 경우 스타일 수정 범위를 컴포넌트 내부로 제한합니다.

### React Component Rules

- 함수형 컴포넌트에 명시적 TypeScript props를 사용합니다.
- Atomic Design 계층(`atoms` → `molecules` → `organisms`)에 맞춰 구성합니다.
- 재사용 가능한 기존 컴포넌트를 먼저 사용하고, 재사용 가치가 있을 때만 새로 만듭니다.
- Hook은 의도를 가지고 사용하고 로직이 읽히도록 유지합니다(`useState`, `useMemo`, `useCallback` 등).
- 폼 입력에서는 controlled/uncontrolled을 같은 렌더 경로에서 섞지 않습니다.
- 체크박스/라디오는 union props 타입으로 유효한 controlled/uncontrolled 조합만 허용합니다.
- 큰 페이지 JSX보다 작고 조합 가능한 컴포넌트를 우선합니다.

## 2) Integrated Cursor Skill (요약/통합)

### Vite + React Atomic UI (`docs/engineering/skills/vite-atomic-ui.md`)

이 skill은 이 레포의 Atomic Design + Tailwind + `globals.css` 토큰 체계를 “같은 패턴”으로 유지하기 위한 지침입니다.
상세 내용은 위 문서를 참조한다.

- 새 페이지/섹션/폼을 만들거나 기존 마크업을 컴포넌트로 바꿀 때 우선 적용
- 레이어링: `atoms` → `molecules` → `organisms` → `pages`
- 폼 제어 규칙: 입력은 한 경로에서만 제어/비제어 방식이 유지되도록 설계
- 필수 체크(새 UI 추가 시): 레이어 배치/재사용 가능 여부/제어 방식 일관성/lint 통과/미사용 코드 정리

## 3) Harness Rules 검수(필수) — “Merge-ready” 조건

아래 항목을 PR/변경 단위로 전부 확인해야 합니다.

### A. 문서 동기화 검수(가장 중요)

1. 변경 영향 범위를 먼저 식별한다(Frontend/Backend/Docs/RAG/Security/DevOps 중 어디가 바뀌는지).
2. 해당 범위에 맞는 문서가 `docs/`에 반영되었는지 확인한다.

필수 문서 매핑(Backend/Frontend)

- API/계약 변경: `docs/api/api-spec.md`
- DB 스키마/관계 변경: `docs/backend/database-schema.md`
- 백엔드 구조/레이어/설계결정: `docs/backend/architecture-decisions.md`
- RAG 수집/청킹/검색 변경: `docs/rag/rag-pipeline.md`, `docs/rag/vector-search.md`
- 인증/RBAC/보안경계 변경: `docs/security/authentication.md`, `docs/security/security-considerations.md`
- 배포/환경/관측 변경: `docs/devops/deployment.md`, `docs/devops/environment-config.md`, `docs/devops/logging-monitoring.md`

- UI/인터랙션 변경: `docs/frontend/ui-spec.md`, `docs/frontend/accessibility.md`, `docs/frontend/design-system.md`
- 컴포넌트 구조 변경: `docs/frontend/component-architecture.md`
- 상태/비동기 흐름 변경: `docs/frontend/state-management.md`
- 라우팅/레이아웃 경계 변경: `docs/frontend/routing.md`

### B. 코드 품질/정합성 검수

- Frontend: `npm run typecheck` 통과
- Backend: `npm run lint:backend`(ruff) 통과
- Backend: `pytest`(가능하면 변경 관련 범위) 통과
- 리팩터링 후 미사용 코드/파일 제거 확인

### C. 런타임/계약 검수(최소)

- API `GET /api/v1/health`가 정상 응답한다
- Admin RBAC이 보호하는 엔드포인트에서 권한 없는 호출이 `403`을 반환한다
- SSE(스트리밍) 엔드포인트가 이벤트 타입/시퀀스를 정상적으로 방출한다
- 감사 로그/보안 이벤트는 “기대하는 시점”에 남는지 확인한다

### D. DB 마이그레이션 안정성 검수(필수)

- 신규/변경 마이그레이션이 생기면:
  - `docs/backend/database-schema.md`에 테이블/컬럼 추가 여부 반영
  - `backend/app/db/migrate.py`의 `HEAD_REVISION`이 “최신 마이그레이션”과 불일치하지 않는지 확인
- 스타트업 시 “거꾸로 stamp”가 발생하지 않도록 확인(로깅에 `Stamping database at head`/revision 관련 메시지 확인)

### E. 보안/프롬프트 인젝션 검수(필수)

- RAG 문서/청크가 모델 컨텍스트에 주입될 때:
  - 문서 내 instruction-like 패턴(프롬프트 인젝션 형태)이 완화/차단되는지 문서에 기록
  - retrieval filter/response post-filter 같은 통제 가이드가 `docs/rag/rag-pipeline.md`에 반영되었는지 확인
- 업로드/추출 파이프라인이 silent corruption(`errors="ignore"`)을 포함한다면:
  - `docs/security/security-considerations.md` 및 운영 리스크에 명시했는지 확인
- 로깅 경계에서 토큰/비밀/민감정보가 출력되지 않는지 확인

## 4) PR 제출 전 “완료” 확인 템플릿

- [ ] 변경 범위 식별(Frontend/Backend/RAG/Security/DevOps)
- [ ] 해당 문서가 모두 업데이트됨(필수 매핑 확인)
- [ ] `npm run typecheck` 통과
- [ ] `npm run lint:backend` 통과
- [ ] `pytest` 통과(또는 변경 범위에 대한 충분한 재현/검증)
- [ ] API health/ready + RBAC + (해당 시) SSE 동작 확인
- [ ] DB 마이그레이션 HEAD_REVISION 불일치/역방향 stamp 없음 확인
- [ ] 보안(업로드/프롬프트 인젝션) 문서/코드 보호조치 동기화 확인

