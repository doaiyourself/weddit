import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];
type StatsRow = Database["public"]["Tables"]["vendor_stats"]["Row"];
type ImageRow = Database["public"]["Tables"]["vendor_images"]["Row"];
type PackageRow = Database["public"]["Tables"]["vendor_packages"]["Row"];
type OptionRow = Database["public"]["Tables"]["vendor_options"]["Row"];

type VendorDetail = VendorRow & {
  vendor_stats: Pick<StatsRow, "avg_rating" | "review_count"> | null;
  vendor_images: Pick<ImageRow, "id" | "url" | "alt" | "sort_order">[];
  vendor_packages: Pick<
    PackageRow,
    "id" | "name" | "description" | "price_min" | "price_max" | "is_representative" | "pricing_notes"
  >[];
  vendor_options: Pick<
    OptionRow,
    "id" | "vendor_name" | "price" | "price_type" | "price_max" | "description"
  >[];
};

const CATEGORY_LABEL: Record<Database["public"]["Enums"]["vendor_category"], string> = {
  studio: "스튜디오",
  dress: "드레스",
  makeup: "메이크업",
};

function formatPrice(won: number): string {
  return `${Math.round(won / 10000)}만원`;
}

function formatOptionPrice(
  price: number,
  priceType: Database["public"]["Enums"]["price_type"],
  priceMax: number | null
): string {
  if (priceType === "negotiable") return "협의";
  if (priceType === "range" && priceMax != null) {
    return `${formatPrice(price)} ~ ${formatPrice(priceMax)}`;
  }
  return formatPrice(price);
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function VendorDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vendors")
    .select(`
      *,
      vendor_stats ( avg_rating, review_count ),
      vendor_images ( id, url, alt, sort_order ),
      vendor_packages ( id, name, description, price_min, price_max, is_representative, pricing_notes ),
      vendor_options ( id, vendor_name, price, price_type, price_max, description )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) notFound();

  const vendor = data as unknown as VendorDetail;
  const images = [...vendor.vendor_images].sort((a, b) => a.sort_order - b.sort_order);
  const packages = [...vendor.vendor_packages].sort((a, b) =>
    a.is_representative === b.is_representative ? 0 : a.is_representative ? -1 : 1
  );
  const stats = vendor.vendor_stats;
  const hasReviews = stats != null && stats.review_count > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/vendors"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        ← 업체 목록
      </Link>

      {/* 이미지 갤러리 */}
      {images.length > 0 && (
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`relative flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 ${
                i === 0 ? "h-72 w-96" : "h-72 w-56"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? vendor.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 90vw, 400px"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      {/* 본문 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 메인 */}
        <div className="space-y-10 lg:col-span-2">
          {/* 업체 기본 정보 */}
          <section>
            <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
              <span>{CATEGORY_LABEL[vendor.category]}</span>
              <span className="text-zinc-300">·</span>
              <span>{vendor.region}</span>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-zinc-900">{vendor.name}</h1>
            {vendor.description && (
              <p className="leading-relaxed text-zinc-600">{vendor.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4">
              {vendor.phone && (
                <a href={`tel:${vendor.phone}`} className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                  {vendor.phone}
                </a>
              )}
              {vendor.instagram && (
                <a
                  href={vendor.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  인스타그램 →
                </a>
              )}
            </div>
          </section>

          {/* 패키지 */}
          {packages.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">패키지</h2>
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`rounded-xl border p-4 ${
                      pkg.is_representative
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900">{pkg.name}</span>
                          {pkg.is_representative && (
                            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-white">
                              대표
                            </span>
                          )}
                        </div>
                        {pkg.description && (
                          <p className="mt-1 text-sm text-zinc-500">{pkg.description}</p>
                        )}
                        {pkg.pricing_notes && (
                          <p className="mt-1 text-xs text-zinc-400">{pkg.pricing_notes}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="font-semibold text-zinc-900">
                          {formatPrice(pkg.price_min)}
                        </span>
                        {pkg.price_max !== pkg.price_min && (
                          <span className="text-zinc-500"> ~ {formatPrice(pkg.price_max)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 선택품목 */}
          {vendor.vendor_options.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">선택품목</h2>
              <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
                {vendor.vendor_options.map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-sm text-zinc-800">{opt.vendor_name}</span>
                      {opt.description && (
                        <p className="mt-0.5 text-xs text-zinc-400">{opt.description}</p>
                      )}
                    </div>
                    <span className="ml-4 flex-shrink-0 text-sm font-medium text-zinc-700">
                      {formatOptionPrice(opt.price, opt.price_type, opt.price_max)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 사이드바 */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-zinc-200 bg-white p-6">
            {/* 별점 */}
            <div className="mb-5">
              {hasReviews ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-zinc-900">
                    {stats!.avg_rating.toFixed(1)}
                  </span>
                  <div>
                    <div className="text-amber-400">
                      {"★".repeat(Math.round(Number(stats!.avg_rating)))}
                      {"☆".repeat(5 - Math.round(Number(stats!.avg_rating)))}
                    </div>
                    <p className="text-xs text-zinc-400">후기 {stats!.review_count}개</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-400">아직 후기가 없어요</p>
              )}
            </div>

            {/* 대표 패키지 가격 */}
            {packages[0] && (
              <div className="mb-6">
                <p className="mb-1 text-xs text-zinc-400">
                  {packages[0].is_representative ? "대표 패키지" : "패키지"}
                </p>
                <p className="text-xl font-bold text-zinc-900">
                  {formatPrice(packages[0].price_min)}
                  {packages[0].price_max !== packages[0].price_min && (
                    <span className="text-base font-normal text-zinc-500">
                      {" "}~ {formatPrice(packages[0].price_max)}
                    </span>
                  )}
                </p>
              </div>
            )}

            <button
              className="w-full cursor-not-allowed rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white opacity-50"
              disabled
            >
              문의하기 (준비 중)
            </button>

            {vendor.address && (
              <p className="mt-4 text-center text-xs text-zinc-400">{vendor.address}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
