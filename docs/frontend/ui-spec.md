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

## Admin Documents Error Visibility

### 1) Purpose

- 문제 정의: 색인 실패 상태만 보이고 실패 원인을 UI에서 즉시 확인하기 어려움
- 사용자 가치: 운영자가 재색인/환경 점검 판단을 빠르게 수행
- 성공 기준: 실패 문서 행에서 오류 사유를 즉시 확인 가능

### 2) UX Behavior

- 문서 테이블에 `오류 사유` 컬럼 추가
- 상태가 `failed`인 경우 `error_message` 표시
- 실패 외 상태는 `—` 표시

### 3) Loading and Error States

- 목록 로딩 중: 기존 skeleton 유지
- 목록 비어 있음: 기존 empty 문구 유지
- API 오류: 기존 toast 에러 흐름 유지

## Screen Spec Template

아래 템플릿을 기능/화면마다 복사해 사용한다.

### [Feature Name]

#### 1) Purpose

- 문제 정의:
- 사용자 가치:
- 성공 기준:

#### 2) UX Behavior

- 초기 진입:
- 주요 인터랙션:
- 상태 전이(success/error/retry):

#### 3) Loading and Error States

- Loading UI:
- Empty UI:
- Error UI:
- Retry 전략:

#### 4) Responsive Behavior

- Desktop (>=1200px):
- Tablet (>=996px, <1200px):
- Small width (<996px 처리 정책):

#### 5) Accessibility

- 키보드 탐색 순서:
- 포커스 표시:
- 스크린리더 라벨/설명:
- 컬러 대비:

#### 6) Dark Mode

- 배경/텍스트 대비:
- 상태 색상(성공/경고/에러):

#### 7) Technical Notes

- 의존 컴포넌트:
- 성능 고려:
- 알려진 리스크:

