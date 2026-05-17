-- supabase/migrations/0004_triggers.sql
-- 트리거 함수 정의 및 연결.
-- 담당: (1) updated_at 자동 갱신, (2) vendor_stats 자동 생성,
--       (3) 후기·문의 변동 시 vendor_stats 재계산.
-- 0002_tables.sql 실행 후에 실행해야 한다.

-- ================================================================
-- 1. set_updated_at — updated_at 자동 갱신
--    대상: vendors, vendor_stats (BEFORE UPDATE)
-- ================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vendor_stats_updated_at
  BEFORE UPDATE ON vendor_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ================================================================
-- 2. create_vendor_stats — 업체 생성 시 vendor_stats 행 자동 삽입.
--    빈 깡통 방지: 신규 업체도 stats row가 항상 존재함을 보장.
--    SECURITY DEFINER: vendor_stats INSERT 권한을 함수 소유자로 실행.
-- ================================================================
CREATE OR REPLACE FUNCTION create_vendor_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO vendor_stats (vendor_id) VALUES (NEW.id);
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_vendors_create_stats
  AFTER INSERT ON vendors
  FOR EACH ROW EXECUTE FUNCTION create_vendor_stats();

-- ================================================================
-- 3. refresh_vendor_review_stats
--    후기 INSERT / UPDATE / DELETE 시 avg_rating·review_count 재계산.
--    vendor_stats.updated_at 은 trg_vendor_stats_updated_at 이 처리.
--    SECURITY DEFINER: 일반 사용자 트리거 컨텍스트에서도 vendor_stats UPDATE 가능.
-- ================================================================
CREATE OR REPLACE FUNCTION refresh_vendor_review_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id uuid;
BEGIN
  v_vendor_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.vendor_id
    ELSE NEW.vendor_id
  END;

  UPDATE vendor_stats
  SET
    avg_rating   = COALESCE(
                     (SELECT AVG(rating)::numeric(3,2)
                      FROM reviews
                      WHERE vendor_id = v_vendor_id),
                     0.00),
    review_count = (SELECT COUNT(*)
                    FROM reviews
                    WHERE vendor_id = v_vendor_id)
  WHERE vendor_id = v_vendor_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reviews_refresh_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_vendor_review_stats();

-- ================================================================
-- 4. refresh_vendor_inquiry_stats
--    문의 INSERT / DELETE 시 inquiry_count 재계산.
--    UPDATE 는 추적하지 않음 (status 변경은 카운트에 영향 없음).
--    SECURITY DEFINER: 일반 사용자 트리거 컨텍스트에서도 vendor_stats UPDATE 가능.
-- ================================================================
CREATE OR REPLACE FUNCTION refresh_vendor_inquiry_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id uuid;
BEGIN
  v_vendor_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.vendor_id
    ELSE NEW.vendor_id
  END;

  UPDATE vendor_stats
  SET
    inquiry_count = (SELECT COUNT(*)
                     FROM inquiries
                     WHERE vendor_id = v_vendor_id)
  WHERE vendor_id = v_vendor_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_inquiries_refresh_stats
  AFTER INSERT OR DELETE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION refresh_vendor_inquiry_stats();
