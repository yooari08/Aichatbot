# Frontend Routing

이 문서는 라우팅 구조, 레이아웃 경계, 페이지 진입 시 데이터 준비 전략을 정의한다.

## Route Inventory

| Route | Purpose | Layout | Data Requirements |
| --- | --- | --- | --- |
| `/chat` | AI 챗봇 인터랙션 | Chat layout | conversations, messages |

## Routing Rules

- 라우트 단위에서 페이지 목적과 데이터 요구사항을 명확히 문서화한다.
- 공통 레이아웃 책임(사이드바/메인영역)은 페이지 루트에서 관리한다.
- 라우트 이동 시 사용자 입력이 손실될 수 있는 경우 가드 정책을 정의한다.

## Chat Route Notes

- 사이드바 토글 상태는 viewport 정책과 사용자 액션을 함께 고려한다.
- 1200px 이하 자동 접힘 정책이 UX와 충돌하지 않도록 명시적 테스트를 수행한다.
- 최소 너비 정책(996px)과 실제 브라우저 동작의 괴리를 QA 시나리오에 포함한다.

## Error and Loading

- 라우트 진입 초기 데이터 로딩 스켈레톤 제공
- 치명적 로딩 실패 시 페이지 수준 에러 안내 + 재시도 액션 제공

## Future Scalability

- 향후 `chat/:conversationId` 형태로 분리 시 데이터 prefetch 전략 검토
- route-level code splitting으로 초기 번들 크기 최적화

