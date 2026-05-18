import Link from "next/link";
import Image from "next/image";
import { Database } from "@/types/database";

type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];
type StatsRow = Database["public"]["Tables"]["vendor_stats"]["Row"];
type ImageRow = Database["public"]["Tables"]["vendor_images"]["Row"];
type PackageRow = Database["public"]["Tables"]["vendor_packages"]["Row"];

export type VendorCardData = Pick<VendorRow, "id" | "name" | "slug" | "category" | "region"> & {
  vendor_stats: Pick<StatsRow, "avg_rating" | "review_count"> | null;
  vendor_images: Pick<ImageRow, "url" | "alt" | "sort_order">[];
  vendor_packages: Pick<PackageRow, "price_min" | "price_max" | "is_representative">[];
};

const CATEGORY_LABEL: Record<Database["public"]["Enums"]["vendor_category"], string> = {
  studio: "스튜디오",
  dress: "드레스",
  makeup: "메이크업",
};

const CATEGORY_STYLE: Record<Database["public"]["Enums"]["vendor_category"], string> = {
  studio: "bg-indigo-50 text-indigo-700",
  dress: "bg-rose-50 text-rose-700",
  makeup: "bg-purple-50 text-purple-700",
};

function formatPrice(won: number): string {
  return `${Math.round(won / 10000)}만원`;
}

interface Props {
  vendor: VendorCardData;
}

export default function VendorCard({ vendor }: Props) {
  const { name, slug, category, region, vendor_stats, vendor_images, vendor_packages } = vendor;

  const representativeImage = [...vendor_images]
    .sort((a, b) => a.sort_order - b.sort_order)[0];

  const representativePackage =
    vendor_packages.find((p) => p.is_representative) ?? vendor_packages[0];

  const hasReviews = vendor_stats != null && vendor_stats.review_count > 0;

  return (
    <Link
      href={`/vendors/${slug}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
    >
      {/* 대표 이미지 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        {representativeImage ? (
          <Image
            src={representativeImage.url}
            alt={representativeImage.alt ?? name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-10 w-10 text-zinc-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 카드 내용 */}
      <div className="p-4">
        {/* 카테고리 배지 + 지역 */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[category]}`}
          >
            {CATEGORY_LABEL[category]}
          </span>
          <span className="text-xs text-zinc-400">{region}</span>
        </div>

        {/* 업체명 */}
        <h2 className="mb-3 font-semibold leading-snug text-zinc-900">{name}</h2>

        {/* 가격대 */}
        {representativePackage ? (
          <p className="mb-2 text-sm text-zinc-700">
            {formatPrice(representativePackage.price_min)}
            {representativePackage.price_max !== representativePackage.price_min &&
              ` ~ ${formatPrice(representativePackage.price_max)}`}
          </p>
        ) : (
          <p className="mb-2 text-sm text-zinc-400">가격 정보 없음</p>
        )}

        {/* 별점 / 후기 */}
        {hasReviews ? (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-amber-400">★</span>
            <span className="font-medium text-zinc-800">
              {vendor_stats!.avg_rating.toFixed(1)}
            </span>
            <span className="text-zinc-400">({vendor_stats!.review_count}개)</span>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">아직 후기가 없어요</p>
        )}
      </div>
    </Link>
  );
}
