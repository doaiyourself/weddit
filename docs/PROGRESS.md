# 웨딧 개발 진행 기록

## Day 1 (2026-05-17, 완료) — 프로젝트 초기 세팅

- Next.js 16.2.6 (App Router) + TypeScript 5 + Tailwind CSS v4 + Turbopack으로 프로젝트 초기화
- `src/` 디렉터리 구조 사용, import alias `@/*` → `src/*` 설정
- 폴더 구조 생성: `src/app/`, `src/components/`, `src/lib/`, `src/types/`, `src/supabase/`
- Supabase 패키지 설치: `@supabase/supabase-js` ^2.105.4, `@supabase/ssr` ^0.10.3
- `src/lib/supabase.ts`: 브라우저용 Supabase 클라이언트 (`createClient` 함수)
- `.env.local.example` 생성 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `.env.local` 생성 (실제 Supabase 프로젝트 키 입력 완료, gitignore)
- Pretendard Variable Font 설치 및 `src/app/layout.tsx`에 전역 적용 (`next/font/local`)
- `src/app/page.tsx`: 홈 페이지 한 줄 ("웨딧 — 가격이 다 보이는 웨딩 플랫폼")
- `CLAUDE.md` 작성 (프로젝트 컨텍스트, 기술 스택, 코드 컨벤션, MVP 범위 등)
- GitHub 연결 및 첫 커밋 푸시 (`https://github.com/doaiyourself/weddit.git`)

## Day 2 (2026-05-17, 완료) — 업체 DB 스키마 설계

- `docs/SCHEMA.md` 작성 완료
- 테이블 12개 설계: vendors, vendor_images, vendor_packages, vendor_price_tiers, option_masters, vendor_options, users, inquiries, messages, reviews, vendor_stats, favorites
- 선택품목 표준 마스터(`option_masters`) 방식으로 업체 간 비교 구조 확립
- 가격 2-레이어 모델 (기본 범위 + 시즌 변동)
- 후기 작성 자격: `reviews.inquiry_id NOT NULL`로 스키마 차원 강제
- `vendor_stats` 캐싱 + trigger 방식으로 빈 깡통 방지 설계

## Day 3 (2026-05-19, 완료) — DB 스키마 설계 및 마이그레이션

- `docs/SCHEMA.md` 작성 및 2차 보완 (RLS·후기 검증 강화)
- SQL 마이그레이션 6개 작성 (0001~0006)
- `create_review` RPC 함수: 후기 작성 5단계 자격 검증
- Supabase에 마이그레이션 6개 전부 실행 완료, 테이블 12개 + RLS 적용

## Day 4 (2026-05-19, 완료) — 개발용 시드 데이터 작성

- `supabase/seed/01_option_masters.sql`: 선택품목 표준 마스터 16개 (studio 8, dress 4, makeup 3, common 1)
  - UUID 하드코딩 (a1000000-... ~ a4000000-...) → 02 파일에서 FK 직접 참조 가능
- `supabase/seed/02_vendors_test.sql`: 강남권 가상 업체 12개 (studio 5, dress 4, makeup 3)
  - 지역: 강남구·서초구 중심, 송파구 1개
  - 가격대: 80만 ~ 730만원 (실제 시장 분포 반영)
  - vendor_packages 13개, vendor_images 36개, vendor_options 54개 포함
  - vendor_stats 는 시드 제외 (trg_vendors_create_stats 트리거가 자동 생성)
  - 프로덕션 유입 방지용 WARNING 헤더 + DO RAISE NOTICE 블록 포함

## Day 5 (예정)



---
※ 이 파일은 매 작업일 끝에 갱신한다.
