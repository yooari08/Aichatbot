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
    - `molecules/MessageBubble`
    - `molecules/EmailModal`

## Change Log (Major)

### Pinned + Email + Sidebar Toggle

- `MessageBubble`에서 메시지 액션(메일 공유) 트리거를 제공
- `MessageFeed`에서 `EmailModal`의 open/close와 대상 메시지 상태를 관리
- `ChatSidebar`에서 pinned 드롭존 및 토글 UX를 담당
- `ChatbotPage`에서 레이아웃 제약과 사이드바 컨테이너 동작을 조정

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

