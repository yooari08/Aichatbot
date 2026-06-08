# Frontend Component Architecture

이 문서는 React 컴포넌트 계층 구조, 재사용 경계, UI/비즈니스 로직 분리를 정의한다.

## Principles

- Atomic Design 계층(`atoms` -> `molecules` -> `organisms`)을 기본으로 한다.
- 페이지 컴포넌트는 조합과 데이터 흐름 연결에 집중한다.
- 비즈니스 로직은 `hooks`, `store`, `services`에 위치시키고 UI에서 분리한다.
- 동일한 UI 패턴은 재사용 컴포넌트로 추출하되 과도한 추상화는 피한다.

## Current High-Level Hierarchy

- `pages/chat/ChatbotPage`
  - `organisms/ChatSidebar`
    - `molecules/ConversationItem`
  - `organisms/MessageFeed`
    - `molecules/MessageBubble` — react-markdown으로 봇 응답 렌더링
    - `molecules/EmailModal`
- `App`
  - `organisms/ErrorBoundary` — 전역 런타임 오류 fallback
- `pages/admin/AdminPage`
  - `organisms/AdminSidebar`
  - `pages/admin/views/RolesView` — 권한 매트릭스 + 사용자 역할 변경
  - `pages/admin/views/AuditLogView` — 감사 로그 테이블 + `TablePagination`
  - `pages/admin/views/QualityView` — 피드백 통계 대시보드
  - `organisms/UsersTable`
    - `InviteUserModal` (inline) — 사용자 초대
    - `UserEditDialog` (inline) — 역할/활성 상태 편집 모달
  - `molecules/TablePagination` — 공통 테이블 페이지네이션

## Change Log (Major)

### Pinned + Email + Sidebar Toggle

- `MessageBubble`에서 메시지 액션(메일 공유) 트리거를 제공
- `MessageFeed`에서 `EmailModal`의 open/close와 대상 메시지 상태를 관리
- `ChatSidebar`에서 pinned 드롭존 및 토글 UX를 담당
- `ChatbotPage`에서 레이아웃 제약과 사이드바 컨테이너 동작을 조정

### Markdown Rendering (봇 메시지)

- `MessageBubble` 봇 응답에 `react-markdown` + `remark-gfm` 적용
- `.markdown-body` CSS 클래스를 `globals.css`에 정의하여 전역 스타일 일관성 유지
- 사용자 메시지는 기존 plain text 유지 (입력값 그대로 표시)

### Admin Views — Roles / AuditLog / Quality

- `RolesView`: 권한 매트릭스(정적) + 사용자별 역할 변경 UI (`PATCH /admin/users/{id}/role`)
- `AuditLogView`: 액션 배지·검색 포함 감사 로그 테이블 (`GET /admin/audit-log`)
- `QualityView`: 만족도 KPI, 긍정/부정 비율 바, 최근 피드백 목록 (`GET /admin/feedback-stats`)

### UserEditDialog (사용자 편집 모달)

- `UsersTable` 내 인라인 컴포넌트로 정의
- 역할(Select) + 활성 상태(Switch) 편집 후 `Promise.all`로 병렬 저장
- 저장 성공 시 목록 로우를 낙관적으로 업데이트, `message_count`는 원본 유지

## Component Spec Template

### [Component Name]

- 책임:
- Props 계약:
- 내부 상태:
- 외부 의존성:
- 재사용 범위:
- 접근성 고려:
- 성능 고려:

## Technical Decisions

- DnD는 UI interaction 레이어에서 처리하고, 실제 pin 상태 업데이트는 hook/store로 위임한다.
- 모달은 메시지 렌더 루프 내부에서 직접 관리하지 않고 상위 피드 레벨에서 단일 인스턴스로 관리한다.
- 레이아웃 애니메이션은 DOM mount/unmount보다 컨테이너 width transition을 우선한다.

## Scalability Notes

- 액션 버튼이 늘어나는 경우 `MessageActions` 전용 컴포넌트 분리를 우선 고려한다.
- 사이드바 섹션이 증가하는 경우 섹션 렌더러(설정 기반) 도입을 검토한다.

