-- supabase/migrations/0002_tables.sql
-- 웨딧 전체 테이블 정의. PK / FK / CHECK 제약 포함.
-- 0001_enums.sql 실행 후에 실행해야 한다.
-- 의존성 순서: users → vendors → (나머지)

-- =====================
-- users
-- =====================
CREATE TABLE users (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname      text,
  wedding_date  date,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- =====================
-- vendors
-- =====================
CREATE TABLE vendors (
  id             uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text            NOT NULL,
  slug           text            NOT NULL UNIQUE,
  category       vendor_category NOT NULL,
  region         text            NOT NULL,
  address        text,
  description    text,
  phone          text,
  instagram      text,
  website        text,
  status         vendor_status   NOT NULL DEFAULT 'pending',
  verified       boolean         NOT NULL DEFAULT false,
  owner_user_id  uuid            REFERENCES users(id) ON DELETE SET NULL,
  created_at     timestamptz     NOT NULL DEFAULT now(),
  updated_at     timestamptz     NOT NULL DEFAULT now()
);

-- =====================
-- vendor_images
-- =====================
CREATE TABLE vendor_images (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   uuid        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  url         text        NOT NULL,
  alt         text,
  sort_order  int         NOT NULL DEFAULT 0
);

-- =====================
-- vendor_packages
-- =====================
CREATE TABLE vendor_packages (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id         uuid        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name              text        NOT NULL,
  description       text,
  price_min         int         NOT NULL,
  price_max         int         NOT NULL,
  pricing_notes     text,
  is_representative boolean     NOT NULL DEFAULT false
);

-- =====================
-- vendor_price_tiers
-- =====================
CREATE TABLE vendor_price_tiers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   uuid        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  tier_name   text        NOT NULL,
  price_min   int         NOT NULL,
  price_max   int         NOT NULL,
  conditions  jsonb
);

-- =====================
-- option_masters
-- =====================
CREATE TABLE option_masters (
  id           uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text            NOT NULL UNIQUE,
  name         text            NOT NULL,
  category     option_category NOT NULL,
  description  text,
  sort_order   int             NOT NULL DEFAULT 0
);

-- =====================
-- vendor_options
-- =====================
CREATE TABLE vendor_options (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id         uuid        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  option_master_id  uuid        REFERENCES option_masters(id) ON DELETE SET NULL,
  vendor_name       text        NOT NULL,
  price             int         NOT NULL,
  price_type        price_type  NOT NULL DEFAULT 'fixed',
  price_max         int,
  description       text,
  CONSTRAINT chk_vendor_options_range
    CHECK (price_type != 'range' OR price_max IS NOT NULL)
);

-- =====================
-- inquiries
-- =====================
CREATE TABLE inquiries (
  id             uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id      uuid            NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status         inquiry_status  NOT NULL DEFAULT 'pending',
  created_at     timestamptz     NOT NULL DEFAULT now(),
  contracted_at  timestamptz
);

-- =====================
-- messages
-- =====================
CREATE TABLE messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id  uuid        NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_id   uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =====================
-- reviews
-- =====================
CREATE TABLE reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   uuid        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- ON DELETE RESTRICT: 후기가 달린 inquiry는 삭제 불가
  inquiry_id  uuid        NOT NULL UNIQUE REFERENCES inquiries(id) ON DELETE RESTRICT,
  rating      smallint    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- 업체당 후기 1개
  CONSTRAINT uq_reviews_user_vendor UNIQUE (user_id, vendor_id)
);

-- =====================
-- vendor_stats
-- =====================
CREATE TABLE vendor_stats (
  vendor_id      uuid           PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
  avg_rating     numeric(3,2)   NOT NULL DEFAULT 0.00,
  review_count   int            NOT NULL DEFAULT 0,
  inquiry_count  int            NOT NULL DEFAULT 0,
  updated_at     timestamptz    NOT NULL DEFAULT now()
);

-- =====================
-- favorites
-- =====================
CREATE TABLE favorites (
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id   uuid        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, vendor_id)
);
