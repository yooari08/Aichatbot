# Frontend Design System Usage

이 문서는 TailwindCSS + shadcn/ui 기반 스타일 사용 원칙과 공통 토큰 사용 규칙을 정의한다.

## Core Principles

- 컴포넌트 레벨 스타일은 Tailwind 유틸리티 우선
- 공통 텍스트/의미 스타일은 `src/styles/globals.css`에서 재사용 클래스화
- shadcn/ui 컴포넌트 사용 시 variant 체계를 우선 활용
- 중복/충돌 클래스 조합을 피하고 읽기 쉬운 class stack 유지

## Current Decisions

- 채팅 영역은 `max-w-[800px] mx-auto`를 기본 컨텐츠 폭으로 유지
- 앱 최소 너비는 `996px` 정책을 따른다
- 사이드바 전환은 width transition 기반으로 처리한다
- Admin 문서 테이블의 오류 정보는 본문 `text-muted-foreground` + `truncate` 패턴으로 표시한다

## Color and Contrast

- 다크 배경에서 텍스트 대비(AA 이상) 우선 점검
- 상태 색상(성공/경고/에러)은 단색 의존이 아닌 텍스트/아이콘/레이블 동시 제공

## Responsive Styling Checklist

- breakpoint별 spacing/typography 검증
- 좁은 폭에서 overflow 및 버튼 hit-area 확인
- hover 전용 피드백에 의존하지 않도록 focus-visible 상태 제공

## Scalability

- 반복되는 UI 패턴은 semantic class로 승격 검토
- 페이지별 임시 클래스가 누적되면 공통 primitive로 추출

