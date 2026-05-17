# 웨딧 DB 스키마 설계

> Day 2 (2026-05-17) 초안, Day 2 보완 (2026-05-17) 확정. SQL 마이그레이션은 별도 작업.

---

## 테이블 목록

| 테이블 | 역할 |
|--------|------|
| `vendors` | 업체 기본 정보 (이름·카테고리·지역·연락처·소유자 등) |
| `vendor_images` | 업체 포트폴리오 이미지 |
| `vendor_packages` | 업체의 기본 패키지 (이름·설명·기본 가격 범위) |
| `vendor_price_tiers` | 시즌·요일별 가격 변동 정보 |
| `option_masters` | 선택품목 표준 마스터 (업체 간 비교 기준) |
| `vendor_options` | 업체별 실제 선택품목 가격 (마스터에 매핑) |
| `users` | 서비스 사용자 (Supabase Auth 기반) |
| `inquiries` | 신혼부부 → 업체 문의 이력 (후기 자격 근거, 복수 허용) |
| `messages` | 1:1 채팅 메시지 |
| `reviews` | 후기 (inquiry_id 필수, 업체당 1개 제한) |
| `vendor_stats` | 평균 별점·후기 수 캐시 |
| `favorites` | 찜 목록 |

---

## 테이블 컬럼 상세

### `vendors`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK |
| `name` | text | NO | 업체명 |
| `slug` | text | NO | URL용 (e.g. `studio-abc`) UNIQUE |
| `category` | enum('studio','dress','makeup') | NO | 스드메 분류 |
| `region` | text | NO | 지역 (e.g. `강남구`, `서초구`) |
| `address` | text | YES | 상세 주소 |
| `description` | text | YES | 업체 소개 |
| `phone` | text | YES | 연락처 |
| `instagram` | text | YES | 인스타그램 URL |
| `website` | text | YES | 홈페이지 URL |
| `status` | enum('active','inactive','pending') | NO | 노출 상태 |
| `verified` | boolean | NO | 관리자 인증 여부 (default false) |
| `owner_user_id` | uuid | YES | FK → users. 업체 계정 소유자. RLS에서 업체 측 접근 제어에 사용 |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | BEFORE UPDATE 트리거로 자동 갱신 |

### `vendor_images`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK |
| `vendor_id` | uuid | NO | FK → vendors |
| `url` | text | NO | Supabase Storage URL |
| `alt` | text | YES | 이미지 설명 |
| `sort_order` | int | NO | 노출 순서 (default 0) |

### `vendor_packages`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK |
| `vendor_id` | uuid | NO | FK → vendors |
| `name` | text | NO | 패키지명 (e.g. "기본 패키지") |
| `description` | text | YES | 패키지 포함 내용 |
| `price_min` | int | NO | 가격 하한 (원) |
| `price_max` | int | NO | 가격 상한 (원) |
| `pricing_notes` | text | YES | 가격 관련 자유 설명 (e.g. "성수기 +20%") |
| `is_representative` | boolean | NO | 대표 패키지 여부 (목록 노출용) |

### `vendor_price_tiers`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK |
| `vendor_id` | uuid | NO | FK → vendors |
| `tier_name` | text | NO | e.g. "성수기 주말", "비수기 평일" |
| `price_min` | int | NO | |
| `price_max` | int | NO | |
| `conditions` | jsonb | YES | `{"months":[5,6,10,11],"days":["sat","sun"]}` |

### `option_masters` *(선택품목 표준 마스터)*
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK |
| `slug` | text | NO | 비교용 키 (e.g. `original-files`) UNIQUE |
| `name` | text | NO | 표준 이름 (e.g. "원본 파일") |
| `category` | enum('studio','dress','makeup','common') | NO | 해당 업종 |
| `description` | text | YES | 이 품목이 무엇인지 설명 |
| `sort_order` | int | NO | 목록 순서 |

### `vendor_options`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK |
| `vendor_id` | uuid | NO | FK → vendors |
| `option_master_id` | uuid | YES | FK → option_masters (NULL = 비표준 항목) |
| `vendor_name` | text | NO | 업체가 부르는 실제 이름 (e.g. "디지털 파일 추가") |
| `price` | int | NO | 가격 (원) |
| `price_type` | enum('fixed','range','negotiable') | NO | 가격 유형 |
| `price_max` | int | YES | range일 때 상한. CHECK: price_type='range'이면 NOT NULL |
| `description` | text | YES | 품목 상세 설명 |

> **CHECK 제약:** `CHECK (price_type != 'range' OR price_max IS NOT NULL)`
> `price_type='range'`인데 `price_max`가 NULL이면 삽입 차단.

### `users`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK = Supabase `auth.users.id` |
| `nickname` | text | YES | 닉네임 |
| `wedding_date` | date | YES | 예식 예정일 |
| `created_at` | timestamptz | NO | |

### `inquiries`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK → users |
| `vendor_id` | uuid | NO | FK → vendors |
| `status` | enum('pending','responded','contracted','closed') | NO | 문의 상태 |
| `created_at` | timestamptz | NO | |
| `contracted_at` | timestamptz | YES | 계약 확인 시각 |

> **문의 정책:** 동일 user-vendor 조합의 문의 복수 허용 (재문의, 채팅 재개 가능).
> 후기는 `reviews.UNIQUE(user_id, vendor_id)`로 업체당 1개로 제한.

### `messages`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK |
| `inquiry_id` | uuid | NO | FK → inquiries |
| `sender_id` | uuid | NO | FK → users |
| `body` | text | NO | 메시지 내용 |
| `created_at` | timestamptz | NO | |

### `reviews`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `id` | uuid | NO | PK |
| `vendor_id` | uuid | NO | FK → vendors |
| `user_id` | uuid | NO | FK → users |
| `inquiry_id` | uuid | NO | FK → inquiries, **UNIQUE** — 문의 1건당 후기 1개 |
| `rating` | smallint | NO | 1~5점 |
| `body` | text | YES | 후기 본문 |
| `created_at` | timestamptz | NO | |

> **제약:**
> - `inquiry_id NOT NULL` — 문의 이력 없는 후기 삽입 원천 차단 (스키마 레벨)
> - `UNIQUE(inquiry_id)` — 문의 1건당 후기 1개
> - `UNIQUE(user_id, vendor_id)` — 업체당 후기 1개
> - `is_contracted` 컬럼 없음. 계약 여부는 `inquiries.contracted_at IS NOT NULL`로 조회 시 계산.

### `vendor_stats`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `vendor_id` | uuid | NO | PK, FK → vendors |
| `avg_rating` | numeric(3,2) | NO | 평균 별점 (default 0.00) |
| `review_count` | int | NO | 후기 수 (default 0) |
| `inquiry_count` | int | NO | 문의 수 (default 0) |
| `updated_at` | timestamptz | NO | BEFORE UPDATE 트리거로 자동 갱신 |

### `favorites`
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| `user_id` | uuid | NO | FK → users |
| `vendor_id` | uuid | NO | FK → vendors |
| `created_at` | timestamptz | NO | |
| PK | (user_id, vendor_id) 복합 | | |

---

## 선택품목 비교 모델

표준 마스터 테이블이 비교의 기준축이 된다.

```
option_masters               vendor_options
─────────────────            ──────────────────────────────────
slug: "original-files"  ←── option_master_id
name: "원본 파일"             vendor_name: "디지털 파일 추가" (A업체)
                         ←── option_master_id
                              vendor_name: "원본 구매"       (B업체)
```

- `option_master_id`가 NULL인 항목은 비표준 품목. 업체 상세에는 노출되지만 업체 간 비교에서는 제외.
- 마스터 항목은 초기에 운영자가 50여 개 세팅. 비표준 항목이 누적되면 주기적으로 마스터로 승격.

---

## 가격 모델링

**2-레이어 구조:**

| 레이어 | 테이블 | 용도 |
|--------|--------|------|
| 기본 범위 | `vendor_packages.price_min / price_max` | 목록 필터링. "200~400만원" 표시 |
| 시즌 변동 | `vendor_price_tiers` | 상세 페이지 "성수기 주말 +20%" 등 |
| 자유 설명 | `vendor_packages.pricing_notes` | 복잡한 가격 정책 텍스트 보완 |

**원칙:** 가격 미입력 업체는 `status = 'pending'`으로 목록 미노출. 투명성 원칙 적용.

---

## 인덱스

```sql
-- 단일 필터
CREATE INDEX idx_vendors_category        ON vendors(category);
CREATE INDEX idx_vendors_region          ON vendors(region);
CREATE INDEX idx_vendors_status          ON vendors(status);

-- 복합 필터 (카테고리 + 지역 — 가장 흔한 패턴)
CREATE INDEX idx_vendors_category_region ON vendors(category, region);

-- 가격 범위 필터
CREATE INDEX idx_packages_price          ON vendor_packages(price_min, price_max);
CREATE INDEX idx_packages_vendor         ON vendor_packages(vendor_id);

-- 평점 정렬
CREATE INDEX idx_stats_rating            ON vendor_stats(avg_rating DESC);

-- 후기 조회
CREATE INDEX idx_reviews_vendor          ON reviews(vendor_id);

-- 선택품목 비교
CREATE INDEX idx_options_master          ON vendor_options(option_master_id);
CREATE INDEX idx_options_vendor          ON vendor_options(vendor_id);

-- 찜 조회
CREATE INDEX idx_favorites_user          ON favorites(user_id);
```

---

## updated_at 자동 갱신

`updated_at` 컬럼이 있는 테이블: `vendors`, `vendor_stats`

공용 트리거 함수 `set_updated_at()`를 정의하고, 각 테이블에 `BEFORE UPDATE` 트리거로 연결한다.
SQL은 마이그레이션 단계에서 작성.

---

## 후기 작성 자격 강제

스키마 레벨:
- `reviews.inquiry_id NOT NULL` — 문의 이력 없는 후기 원천 차단
- `UNIQUE(inquiry_id)` — 문의 1건당 후기 1개
- `UNIQUE(user_id, vendor_id)` — 업체당 후기 1개

애플리케이션 레이어 추가 검증:
- `reviews.user_id = inquiries.user_id` (본인 문의만)
- `reviews.vendor_id = inquiries.vendor_id` (해당 업체만)
- `inquiry.status IN ('responded', 'contracted')` (최소 답변 확인된 문의만)

계약 여부 표시: `inquiries.contracted_at IS NOT NULL`로 조회 시 계산. 별도 컬럼 없음.

---

## RLS 정책

### 공개 읽기 테이블 (업체 관련 정보)
대상: `vendors`, `vendor_images`, `vendor_packages`, `vendor_price_tiers`,
`option_masters`, `vendor_options`, `vendor_stats`

| 작업 | 정책 |
|------|------|
| SELECT | 전체 공개 (`true`) |
| INSERT / UPDATE / DELETE | service_role만 허용 |

### `users`
| 작업 | 정책 |
|------|------|
| SELECT | `auth.uid() = id` |
| UPDATE | `auth.uid() = id` |
| INSERT | Supabase Auth 트리거로 처리 |
| DELETE | 불가 |

### `inquiries`
| 작업 | 정책 |
|------|------|
| SELECT | `auth.uid() = user_id` OR `auth.uid() = (SELECT owner_user_id FROM vendors WHERE id = vendor_id)` |
| INSERT | `auth.uid() = user_id` |
| UPDATE | service_role만 (status 변경은 관리자 또는 트리거) |
| DELETE | 불가 |

### `messages`
| 작업 | 정책 |
|------|------|
| SELECT | 해당 inquiry의 `user_id` 또는 `vendor.owner_user_id` |
| INSERT | 동일 |
| UPDATE / DELETE | 불가 |

### `reviews`
| 작업 | 정책 |
|------|------|
| SELECT | 전체 공개 (`true`) |
| INSERT | `auth.uid() = user_id` AND 본인의 `inquiry_id`임을 확인 |
| UPDATE | `auth.uid() = user_id` |
| DELETE | `auth.uid() = user_id` |

### `favorites`
| 작업 | 정책 |
|------|------|
| ALL | `auth.uid() = user_id` |

---

## 빈 깡통 방지 — 신규 업체 평점

**방식: `vendor_stats` 캐싱 + Supabase DB trigger**

- 업체 생성 시 `vendor_stats` row를 `avg_rating=0.00, review_count=0`으로 함께 삽입
- 후기 INSERT/DELETE 시 trigger로 자동 갱신
- 화면 규칙:
  - `review_count = 0` → "아직 후기가 없어요" 문구 표시
  - `review_count > 0` → 별점 + 후기 수 표시
  - 평점 정렬 시 `review_count = 0` 업체는 하단 배치 (0점이 상위 노출되는 문제 방지)
