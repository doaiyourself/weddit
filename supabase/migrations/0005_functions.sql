-- supabase/migrations/0005_functions.sql
-- 후기 작성 RPC 함수 정의.
-- SECURITY DEFINER로 실행되어 RLS를 우회하고 삽입하되,
-- 함수 내부에서 5가지 자격 조건을 순서대로 검증한다.
-- 0002_tables.sql, 0004_triggers.sql 실행 후에 실행해야 한다.

-- ================================================================
-- create_review
--
-- 검증 조건 (순서대로):
--   1. 호출자(auth.uid())가 해당 inquiry의 user 본인일 것
--   2. inquiry가 p_vendor_id에 대한 문의인지 일치 확인
--   3. inquiry.status 가 'responded' 또는 'contracted' 일 것
--   4. 같은 inquiry_id 로 이미 작성된 후기가 없을 것 (문의당 1개)
--   5. 같은 user_id + vendor_id 조합의 후기가 없을 것 (업체당 1개)
--
-- 하나라도 어긋나면 명확한 에러 메시지와 함께 중단.
-- 모두 통과하면 reviews 에 삽입 후 생성된 row 반환.
-- ================================================================
CREATE OR REPLACE FUNCTION create_review(
  p_vendor_id  uuid,
  p_inquiry_id uuid,
  p_rating     smallint,
  p_body       text DEFAULT NULL
)
RETURNS reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inquiry  inquiries%ROWTYPE;
  v_review   reviews%ROWTYPE;
BEGIN
  -- inquiry 존재 확인 (없으면 이후 검증 불필요)
  SELECT * INTO v_inquiry
  FROM inquiries
  WHERE id = p_inquiry_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'inquiry_not_found'
      USING HINT = '존재하지 않는 문의입니다.';
  END IF;

  -- 조건 1: 호출자가 해당 inquiry의 user 본인인지 확인
  IF v_inquiry.user_id != auth.uid() THEN
    RAISE EXCEPTION 'not_your_inquiry'
      USING HINT = '본인의 문의에만 후기를 작성할 수 있습니다.';
  END IF;

  -- 조건 2: inquiry가 해당 vendor에 대한 문의인지 확인
  IF v_inquiry.vendor_id != p_vendor_id THEN
    RAISE EXCEPTION 'inquiry_vendor_mismatch'
      USING HINT = '이 문의는 해당 업체에 대한 문의가 아닙니다.';
  END IF;

  -- 조건 3: inquiry.status 가 'responded' 또는 'contracted' 인지 확인
  IF v_inquiry.status NOT IN ('responded', 'contracted') THEN
    RAISE EXCEPTION 'inquiry_not_eligible'
      USING HINT = '업체 답변이 완료된 문의에만 후기를 작성할 수 있습니다.';
  END IF;

  -- 조건 4: 같은 inquiry_id 로 이미 작성된 후기가 없는지 확인
  IF EXISTS (
    SELECT 1 FROM reviews WHERE inquiry_id = p_inquiry_id
  ) THEN
    RAISE EXCEPTION 'review_already_exists_for_inquiry'
      USING HINT = '이 문의에 대한 후기가 이미 존재합니다. 문의당 후기는 1개만 작성할 수 있습니다.';
  END IF;

  -- 조건 5: 같은 user_id + vendor_id 조합의 후기가 없는지 확인
  IF EXISTS (
    SELECT 1 FROM reviews
    WHERE user_id = auth.uid() AND vendor_id = p_vendor_id
  ) THEN
    RAISE EXCEPTION 'review_already_exists_for_vendor'
      USING HINT = '이 업체에 대한 후기가 이미 존재합니다. 업체당 후기는 1개만 작성할 수 있습니다.';
  END IF;

  -- 모든 조건 통과 → 삽입
  INSERT INTO reviews (vendor_id, user_id, inquiry_id, rating, body)
  VALUES (p_vendor_id, auth.uid(), p_inquiry_id, p_rating, p_body)
  RETURNING * INTO v_review;

  RETURN v_review;
END;
$$;

-- authenticated 역할에만 실행 권한 부여.
-- anon 제외: SECURITY DEFINER 함수를 비로그인 사용자가 호출하면
-- 함수 소유자(postgres) 권한으로 실행되므로 위험.
GRANT EXECUTE ON FUNCTION create_review(uuid, uuid, smallint, text) TO authenticated;
