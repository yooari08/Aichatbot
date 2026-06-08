# Frontend Accessibility

이 문서는 주요 UI 기능의 접근성 기준과 검증 체크리스트를 정의한다.

## Baseline Requirements

- 모든 인터랙티브 요소는 키보드로 접근 가능해야 한다.
- 의미 있는 요소는 적절한 semantic role/label을 가져야 한다.
- 포커스 인디케이터는 시각적으로 명확해야 한다.
- 다크모드 포함 텍스트 대비는 WCAG 기준을 충족해야 한다.

## Feature Notes

### Chat Sidebar + Pinned

- 드래그앤드롭 기능은 대체 경로(메뉴의 pin/unpin) 제공
- pinned 드롭존 상태 변화는 텍스트/스타일 모두로 전달

### Message Actions + Email Modal

- 액션 아이콘 버튼에 명확한 `aria-label` 제공
- 모달 open 시 포커스 트랩, close 시 트리거로 포커스 복귀
- 전송 실패 시 스크린리더가 인지 가능한 에러 메시지 제공

### Admin Audit Log + Table Pagination

- 액션 필터 `Select`와 이메일 검색 `SearchInput` 모두 키보드 접근 가능
- 페이지네이션 이전/다음 버튼에 시각적 disabled 상태 제공
- 빈 상태/로딩 상태를 텍스트로 명시 (`로딩 중...`, `감사 로그가 없습니다.`)

### Global Error Boundary

- 런타임 오류 시 사용자 친화적 fallback UI 제공
- `다시 시도` / `페이지 새로고침` 버튼으로 복구 경로 제공
- 개발 환경에서만 오류 메시지/스택 표시 (`import.meta.env.DEV`)

### Admin Documents Error Visibility

- 실패 문서의 오류 텍스트는 상태 컬럼과 분리해 `오류 사유` 컬럼으로 노출
- 긴 오류 문구는 셀 내 축약 표시하고 `title`로 전체 텍스트 확인 가능
- 실패 외 상태는 `—`로 일관 표기해 시각적 혼동 최소화

## Testing Checklist

- Tab/Shift+Tab 순환 검증
- Enter/Space 조작 검증
- Esc로 모달 닫기 검증
- 스크린리더(이름/역할/상태) 검증
- 200% 확대 시 레이아웃 붕괴 여부 검증

## Known Risks

- 아이콘 전용 버튼이 툴팁에만 의미를 의존할 가능성
- DnD 상호작용이 키보드 사용자에게 충분히 안내되지 않을 가능성

## Future Work

- aria-live를 활용한 상태 알림 표준화
- 고대비 모드에서의 토큰 검증 자동화

