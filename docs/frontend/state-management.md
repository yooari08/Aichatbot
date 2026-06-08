# Frontend State Management

이 문서는 UI 상태, 서버 상태, 파생 상태의 경계를 정의하고 안전한 상태 흐름을 유지하기 위한 기준을 제공한다.

## State Classification

- Local UI State: 모달 open/close, hover, draft 입력값
- Server State: API 응답 데이터(React Query)
- Shared Client State: 전역 UI/세션 상태(Zustand)
- Derived State: selector/useMemo로 계산되는 표시용 값

## Current Feature State Flow

### Chat Core

- 데이터 로딩: React Query로 대화/메시지 조회
- 사용자 액션: UI 이벤트 -> hook/store 액션 -> API 호출 -> 캐시 갱신

### Pinned Conversations

- pin/unpin 트리거: `ConversationItem` 또는 드롭존
- 업데이트 경로: page hook 액션 -> 대화 목록 상태 갱신 -> 사이드바 재렌더

### Email Share Modal

- 열기 트리거: `MessageBubble` 액션 클릭
- 상태 소유: `MessageFeed`(선택 메시지 + open boolean)
- 닫기: 전송 완료/취소 시 상태 초기화

### Message Feedback (좋아요/싫어요)

- 상태 소유: `useChat` hook — `likedMessages: Record<string, boolean | null>`
- 초기화: `localStorage` 키 `chat_liked_messages`에서 복원 (`loadLikedMessages`)
- 업데이트: 버튼 클릭 → state 갱신 → `saveLikedMessages`(localStorage) → `POST /messages/{id}/feedback` API 호출
- API 실패는 `.catch(() => {})` 로 무시 (로컬 상태는 유지)
- 동일 값 재클릭 시 `null`(철회)로 토글

## Rules

- UI 컴포넌트에서 직접 API 호출하지 않는다(예외 시 근거 문서화).
- 비동기 업데이트는 loading/error/success 상태를 명시적으로 다룬다.
- React Query 캐시 키는 기능 단위로 일관되게 관리한다.
- Zustand store는 UI 표현 세부사항보다 도메인 상태 중심으로 설계한다.

## Async Safety Checklist

- stale closure 방지(useCallback/useEffect deps 점검)
- race condition 방지(중복 요청/취소 처리)
- optimistic update 사용 시 rollback 정의
- unmount 이후 setState 경고 방지

## Scalability Notes

- 대화량 증가 시 리스트 가상화(windowing) 검토
- 캐시 무효화 범위가 커질 경우 partial update 전략 도입

