# Frontend UI Spec

이 문서는 화면 단위 UX 동작과 상태(loading/error/empty/success), 반응형 동작을 정의한다.

## Document Rules

- 주요 UI 변경 시 반드시 함께 업데이트한다.
- 구현 코드와 문서의 용어(컴포넌트명, 상태명)를 일치시킨다.
- 미정 사항은 TODO로 남기고 담당자를 명시한다.

## Feature Index

| Feature | Route/Entry | Owner | Status |
| --- | --- | --- | --- |
| Chat Core | `/chat` | Frontend | Active |
| Pinned Conversations | `/chat` sidebar | Frontend | Active |
| Email Share Modal | message actions | Frontend | Active |
| Admin Documents Error Visibility | `/admin` documents table | Frontend | Active |
| Markdown Bot Rendering | `/chat` message feed | Frontend | Active |
| Message Feedback (Like/Dislike) | `/chat` message actions | Frontend | Active |
| Admin Roles View | `/admin` → 역할/권한 | Frontend | Active |
| Admin Audit Log View | `/admin` → 감사 로그 | Frontend | Active |
| User Invite Modal | `/admin` → 사용자 목록 | Frontend | Active |
| Global Error Boundary | App root | Frontend | Active |
| Admin Quality View | `/admin` → 품질 분석 | Frontend | Active |
| User Edit Modal | `/admin` → 사용자 목록 | Frontend | Active |

## Markdown Bot Rendering

### Markdown — Purpose

- 문제 정의: 봇 응답이 줄바꿈만 처리돼 목록·코드블록·볼드 등이 raw text로 표시됨
- 사용자 가치: 구조화된 답변을 읽기 쉬운 형태로 표시
- 성공 기준: 목록, 코드블록, 볼드, 테이블이 렌더링됨

### Markdown — UX Behavior

- 봇 메시지에만 `react-markdown` + `remark-gfm` 적용
- 사용자 메시지는 plain text 유지
- `.markdown-body` 래퍼 클래스로 스타일 격리

### Markdown — Loading and Error States

- 스트리밍 중 부분 Markdown도 실시간 렌더링
- 렌더링 오류 시 react-markdown 기본 fallback 적용

## Admin Roles View

### Roles — Purpose

- 역할별 권한 매트릭스 확인 및 개별 사용자 역할 변경
- 성공 기준: 역할 변경 후 목록 즉시 반영, toast 알림

### Roles — UX Behavior

- 상단: 정적 권한 매트릭스 (admin/user 기능 허용 여부)
- 하단: 사용자 목록 + 역할 변경 버튼 (현재 역할이 활성 표시)
- 저장 중 버튼 disabled 처리

### Roles — Loading and Error States

- Loading: skeleton row
- Error: toast.error

## Admin Quality View

### Quality — Purpose

- 봇 응답 만족도 지표 확인 (긍정/부정 피드백 통계)

### Quality — UX Behavior

- KPI: 만족도%, 이번 달 피드백 수, 긍정/부정 건수
- 비율 바: 녹색(긍정) / 빨간(부정) 좌우 분할
- 최근 피드백 목록: 사용자 이메일, 대화 제목, 메시지 미리보기

### Quality — Loading and Error States

- Loading: skeleton
- Error: toast.error + 빈 상태 유지

## Admin Audit Log View

### Audit Log — Purpose

- 관리자가 로그인·사용자 변경 등 보안 이벤트를 추적

### Audit Log — UX Behavior

- 이메일 검색 + 액션 필터(전체/CREATE/UPDATE/DELETE/LOGIN/LOGIN_FAILED)
- 페이지네이션(20건 단위)
- 액션별 색상 배지 표시

### Audit Log — Loading and Error States

- Loading: `로딩 중...`
- Empty: `감사 로그가 없습니다.`
- Error: toast.error

## User Edit Modal

### User Edit — Purpose

- 관리자가 사용자 역할과 활성 상태를 인라인으로 변경

### User Edit — UX Behavior

- 사용자 목록 행의 `편집` 버튼 → Dialog 열림
- 역할 Select + 활성화 Switch
- 저장 시 변경된 항목만 API 호출 (`Promise.all`)
- 저장 성공 시 Dialog 닫힘 + 목록 로우 즉시 업데이트

### User Edit — Loading and Error States

- 저장 중: 버튼 `저장 중…` + disabled
- Error: toast.error, Dialog 유지

## Admin Documents Error Visibility

### Documents — Purpose

- 문제 정의: 색인 실패 상태만 보이고 실패 원인을 UI에서 즉시 확인하기 어려움
- 사용자 가치: 운영자가 재색인/환경 점검 판단을 빠르게 수행
- 성공 기준: 실패 문서 행에서 오류 사유를 즉시 확인 가능

### Documents — UX Behavior

- 문서 테이블에 `오류 사유` 컬럼 추가
- 상태가 `failed`인 경우 `error_message` 표시
- 실패 외 상태는 `—` 표시

### Documents — Loading and Error States

- 목록 로딩 중: 기존 skeleton 유지
- 목록 비어 있음: 기존 empty 문구 유지
- API 오류: 기존 toast 에러 흐름 유지

## Screen Spec Template

아래 템플릿을 기능/화면마다 복사해 사용한다.

### [Feature Name]

### 1) Purpose

- 문제 정의:
- 사용자 가치:
- 성공 기준:

### 2) UX Behavior

- 초기 진입:
- 주요 인터랙션:
- 상태 전이(success/error/retry):

### 3) Loading and Error States

- Loading UI:
- Empty UI:
- Error UI:
- Retry 전략:

### 4) Responsive Behavior

- Desktop (>=1200px):
- Tablet (>=996px, <1200px):
- Small width (<996px 처리 정책):

### 5) Accessibility

- 키보드 탐색 순서:
- 포커스 표시:
- 스크린리더 라벨/설명:
- 컬러 대비:

### 6) Dark Mode

- 배경/텍스트 대비:
- 상태 색상(성공/경고/에러):

### 7) Technical Notes

- 의존 컴포넌트:
- 성능 고려:
- 알려진 리스크:

