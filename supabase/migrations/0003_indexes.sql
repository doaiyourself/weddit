-- supabase/migrations/0003_indexes.sql
-- 검색·필터·정렬 성능을 위한 인덱스 정의.
-- 0002_tables.sql 실행 후에 실행해야 한다.
--
-- 참고: PK 및 UNIQUE 제약(vendors.slug, reviews.inquiry_id,
-- reviews.(user_id,vendor_id), favorites.(user_id,vendor_id) 등)은
-- PostgreSQL이 자동으로 인덱스를 생성하므로 중복 생성하지 않는다.

-- =====================
-- vendors — 단일 필터
-- =====================
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_region   ON vendors(region);
CREATE INDEX idx_vendors_status   ON vendors(status);

-- vendors — 복합 필터 (카테고리 + 지역, 가장 흔한 패턴)
CREATE INDEX idx_vendors_category_region ON vendors(category, region);

-- vendors — RLS에서 owner_user_id 조회 사용
CREATE INDEX idx_vendors_owner ON vendors(owner_user_id);

-- =====================
-- vendor_packages — 가격 범위 필터
-- =====================
CREATE INDEX idx_packages_vendor ON vendor_packages(vendor_id);
CREATE INDEX idx_packages_price  ON vendor_packages(price_min, price_max);

-- =====================
-- vendor_options — 선택품목 비교
-- =====================
CREATE INDEX idx_options_vendor ON vendor_options(vendor_id);
CREATE INDEX idx_options_master ON vendor_options(option_master_id);

-- =====================
-- inquiries — 사용자/업체별 문의 목록, RLS 조회
-- =====================
CREATE INDEX idx_inquiries_user   ON inquiries(user_id);
CREATE INDEX idx_inquiries_vendor ON inquiries(vendor_id);

-- =====================
-- messages — 채팅 내역 조회
-- =====================
CREATE INDEX idx_messages_inquiry ON messages(inquiry_id);

-- =====================
-- reviews — 업체별 후기 조회
-- =====================
CREATE INDEX idx_reviews_vendor ON reviews(vendor_id);

-- =====================
-- vendor_stats — 평점 내림차순 정렬
-- =====================
CREATE INDEX idx_stats_rating ON vendor_stats(avg_rating DESC);

-- =====================
-- favorites — 사용자 찜 목록
-- =====================
CREATE INDEX idx_favorites_user ON favorites(user_id);
