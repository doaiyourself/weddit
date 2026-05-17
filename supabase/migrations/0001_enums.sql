-- supabase/migrations/0001_enums.sql
-- 웨딧 서비스에서 사용하는 모든 PostgreSQL enum 타입 정의.
-- 반드시 테이블 생성(0002) 전에 실행해야 한다.

CREATE TYPE vendor_category AS ENUM (
  'studio',   -- 스튜디오
  'dress',    -- 드레스
  'makeup'    -- 메이크업
);

CREATE TYPE vendor_status AS ENUM (
  'active',    -- 목록 노출 중
  'inactive',  -- 비노출 (업체 요청 또는 운영자 처리)
  'pending'    -- 가격 미입력 등 검토 대기
);

CREATE TYPE option_category AS ENUM (
  'studio',
  'dress',
  'makeup',
  'common'  -- 업종 공통 선택품목
);

CREATE TYPE price_type AS ENUM (
  'fixed',       -- 단일 고정 가격
  'range',       -- 가격 범위 (price ~ price_max)
  'negotiable'   -- 협의
);

CREATE TYPE inquiry_status AS ENUM (
  'pending',      -- 문의 접수, 업체 미답변
  'responded',    -- 업체 답변 완료
  'contracted',   -- 계약 확인
  'closed'        -- 종료 (취소 또는 종결)
);
