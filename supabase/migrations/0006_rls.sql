-- supabase/migrations/0006_rls.sql
-- RLS 활성화 + 테이블별 접근 정책 정의.
-- 0002_tables.sql, 0005_functions.sql 실행 후에 실행해야 한다.
--
-- [service_role 참고]
-- Supabase의 service_role 키는 RLS를 기본적으로 우회한다.
-- 따라서 관리자 작업(업체 등록·수정 등)은 별도 INSERT/UPDATE 정책 없이
-- service_role 키로 수행하면 된다.

-- ================================================================
-- RLS 활성화
-- ================================================================
ALTER TABLE vendors             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_packages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_price_tiers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_masters      ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_options      ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_stats        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites           ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 공개 읽기 테이블 (업체 관련 정보)
-- SELECT: 전체 공개 / INSERT·UPDATE·DELETE: service_role만 (RLS 우회)
-- ================================================================
CREATE POLICY "public_read_vendors"
  ON vendors FOR SELECT USING (true);

CREATE POLICY "public_read_vendor_images"
  ON vendor_images FOR SELECT USING (true);

CREATE POLICY "public_read_vendor_packages"
  ON vendor_packages FOR SELECT USING (true);

CREATE POLICY "public_read_vendor_price_tiers"
  ON vendor_price_tiers FOR SELECT USING (true);

CREATE POLICY "public_read_option_masters"
  ON option_masters FOR SELECT USING (true);

CREATE POLICY "public_read_vendor_options"
  ON vendor_options FOR SELECT USING (true);

CREATE POLICY "public_read_vendor_stats"
  ON vendor_stats FOR SELECT USING (true);

-- ================================================================
-- users
-- 본인 row만 읽기·수정. 삭제 불가. INSERT는 Auth 트리거가 처리.
-- ================================================================
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ================================================================
-- inquiries
-- 문의 당사자(user) 또는 해당 업체 소유자만 접근.
-- status 변경은 service_role(또는 트리거)이 처리하므로 UPDATE 정책 없음.
-- ================================================================
CREATE POLICY "inquiries_select_participant"
  ON inquiries FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = (
      SELECT owner_user_id FROM vendors WHERE id = inquiries.vendor_id
    )
  );

CREATE POLICY "inquiries_insert_own"
  ON inquiries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- messages
-- 해당 inquiry의 당사자만 읽기·작성. 수정·삭제 불가.
-- ================================================================
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = messages.inquiry_id
        AND (
          inquiries.user_id = auth.uid()
          OR auth.uid() = (
            SELECT owner_user_id FROM vendors WHERE id = inquiries.vendor_id
          )
        )
    )
  );

CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = messages.inquiry_id
        AND (
          inquiries.user_id = auth.uid()
          OR auth.uid() = (
            SELECT owner_user_id FROM vendors WHERE id = inquiries.vendor_id
          )
        )
    )
  );

-- ================================================================
-- reviews
-- SELECT: 전체 공개.
-- INSERT: create_review() RPC(SECURITY DEFINER)로만 허용.
--         직접 INSERT는 전체 차단.
-- UPDATE·DELETE: 본인 후기만.
-- ================================================================
CREATE POLICY "public_read_reviews"
  ON reviews FOR SELECT USING (true);

-- 직접 INSERT 차단 — create_review() RPC를 통해서만 삽입 가능
CREATE POLICY "reviews_insert_deny_direct"
  ON reviews FOR INSERT
  WITH CHECK (false);

CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ================================================================
-- favorites
-- 본인 것만 전체 접근.
-- ================================================================
CREATE POLICY "favorites_all_own"
  ON favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
