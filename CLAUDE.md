# 웨딧 (Weddit) — 프로젝트 컨텍스트

## 1. 사업 한 줄

결혼 준비 시장의 정보 비대칭을 해소하기 위해, 웨딩 업체의 가격·후기를
투명하게 공개하고 업체와 신혼부부를 직접 연결하는 중개·매칭 플랫폼.
초기 타겟은 서울 강남권.

## 2. 핵심 원칙 (모든 코딩 결정은 이 원칙을 따른다)

- **중립성**: 검색·매칭 순위는 객관 지표(후기·가격·응답률)로만 결정.
  광고는 "광고"라고 명시된 별도 슬롯에서만. 순위에 광고 가중치 절대 금지.
- **투명성**: 가격 정보를 숨기는 UX 금지. "상담 후 공개" 같은 패턴 금지.
- **빈 깡통 방지**: 데이터가 부족한 화면에서도 의미 있는 콘텐츠/문구를 보여줄 것.
- **개인정보 최소 수집**: 회원가입은 최대한 뒤로. 가능하면 비로그인 사용 허용.

## 3. 기술 스택

- **웹 프레임워크**: Next.js 16.2.6 (App Router) + React 19
- **언어**: TypeScript 5 (strict mode)
- **스타일**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **폰트**: Pretendard Variable Font (`next/font/local`, `pretendard` ^1.3.9)
- **백엔드**: Supabase — `@supabase/supabase-js` ^2 + `@supabase/ssr` (SSR 지원)
- **배포**: Vercel
- **앱 (추후 개발)**: React Native + Expo, TypeScript

### 주요 설정
- Import alias: `@/*` → `src/*`
- 개발 서버: Turbopack (`next dev`)
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. 폴더 구조

```
/
├── src/
│   ├── app/          ← 라우트와 페이지 (App Router)
│   │   ├── layout.tsx   (Pretendard 전역 폰트, 메타데이터)
│   │   ├── page.tsx     (홈 페이지)
│   │   └── globals.css  (Tailwind import, CSS 변수)
│   ├── components/   ← 재사용 UI 컴포넌트
│   ├── lib/          ← 유틸리티, Supabase 클라이언트
│   │   └── supabase.ts  (createClient — 브라우저용)
│   ├── types/        ← TypeScript 타입 정의
│   └── supabase/     ← DB 마이그레이션, seed
├── docs/             ← 프로젝트 문서 (SCHEMA.md, PROGRESS.md 등) [미생성]
├── .env.local        ← 실제 환경변수 (gitignore)
├── .env.local.example
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## 5. 코드 컨벤션

- 모든 파일 TypeScript. JavaScript 파일 생성 금지.
- 함수형 컴포넌트 + React Hooks.
- 서버 컴포넌트 우선. 인터랙션 필요할 때만 `'use client'`.
- 데이터 페칭은 Supabase 클라이언트 사용.
- 스타일은 Tailwind 유틸리티 클래스. 인라인 스타일 / styled-components 금지.

## 6. 작업 규칙 (Claude는 반드시 지킬 것)

- 작은 단위로 작업. 한 번에 한 화면, 한 컴포넌트.
- 새 의존성(npm 패키지) 추가 전 반드시 사용자에게 물어볼 것.
- DB 스키마 변경 / 마이그레이션은 사용자 승인 후에만.
- 기존 코드 구조를 임의로 리팩토링하지 말 것. 사용자가 요청할 때만.
- 에러는 추측으로 고치지 말 것. 원인 진단 → 사용자 확인 → 수정 순서.
- 코드 작성 전, 큰 작업은 설계안부터 제시할 것.

## 7. 도메인 용어

- **스드메**: 스튜디오·드레스·메이크업. 결혼 준비의 핵심 3업종.
- **예신/예랑**: 예비신부/예비신랑.
- **헬퍼**: 본식 당일 신부 의상·메이크업 보조 인력.
- **선택품목**: 기본 패키지에 미포함된 추가 결제 항목 (50여 개에 달함).
- **참가격**: 한국소비자원이 운영하는 공식 결혼서비스 가격 비교 사이트.

## 8. MVP 범위 (이 외 기능은 만들지 않는다)

1. 업체 프로필·포트폴리오·가격대 공개
2. 카테고리·다중조건 필터 (지역·가격대·평점)
3. 예산 계산기 (조건 입력 → 강남권 평균 레인지 출력)
4. 신혼부부 ↔ 업체 1:1 채팅 문의
5. 검증된 후기 (실제 문의·계약 이력 보유자만 작성)
6. 찜 및 업체 비교

범위 밖 (2차 개발로 미룸): 결제 연동, 계약서, 일정관리, 청첩장, 하객관리.

## 9. 현재 진행 상황

→ 상세 진행 기록은 `docs/PROGRESS.md` 참고.
