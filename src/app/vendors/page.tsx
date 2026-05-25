import { createClient } from "@/lib/supabase/server";
import CategoryTabs from "@/components/vendors/CategoryTabs";
import VendorFilters, { type FilterState } from "@/components/vendors/VendorFilters";
import VendorCard, { type VendorCardData } from "@/components/vendors/VendorCard";
import { Database } from "@/types/database";

type Category = Database["public"]["Enums"]["vendor_category"];

const VALID_CATEGORIES: Category[] = ["studio", "dress", "makeup"];
const VALID_SORTS = ["name", "rating", "reviews"];
const PRICE_FILTER: Record<string, (min: number) => boolean> = {
  low: (min) => min <= 1_000_000,
  mid: (min) => min > 1_000_000 && min <= 3_000_000,
  high: (min) => min > 3_000_000 && min <= 5_000_000,
  premium: (min) => min > 5_000_000,
};

function applyPriceFilter(vendors: VendorCardData[], price: string | null): VendorCardData[] {
  if (!price || !PRICE_FILTER[price]) return vendors;
  const test = PRICE_FILTER[price];
  return vendors.filter((v) => {
    const pkg = v.vendor_packages.find((p) => p.is_representative) ?? v.vendor_packages[0];
    return pkg ? test(pkg.price_min) : false;
  });
}

function applySort(vendors: VendorCardData[], sort: string): VendorCardData[] {
  return [...vendors].sort((a, b) => {
    if (sort === "rating") {
      return (b.vendor_stats?.avg_rating ?? 0) - (a.vendor_stats?.avg_rating ?? 0);
    }
    if (sort === "reviews") {
      return (b.vendor_stats?.review_count ?? 0) - (a.vendor_stats?.review_count ?? 0);
    }
    return a.name.localeCompare(b.name, "ko");
  });
}

interface Props {
  searchParams: Promise<{ category?: string; region?: string; price?: string; sort?: string }>;
}

export default async function VendorsPage({ searchParams }: Props) {
  const { category: rawCategory, region: rawRegion, price: rawPrice, sort: rawSort } =
    await searchParams;

  const category = VALID_CATEGORIES.includes(rawCategory as Category)
    ? (rawCategory as Category)
    : null;
  const region = rawRegion ?? null;
  const price = rawPrice ?? null;
  const sort = VALID_SORTS.includes(rawSort ?? "") ? (rawSort as string) : "name";

  const filterState: FilterState = { category, region, price, sort };

  const supabase = await createClient();

  let query = supabase
    .from("vendors")
    .select(`
      id, name, slug, category, region,
      vendor_stats ( avg_rating, review_count ),
      vendor_images ( url, alt, sort_order ),
      vendor_packages ( price_min, price_max, is_representative )
    `)
    .eq("status", "active");

  if (category) query = query.eq("category", category);
  if (region) query = query.eq("region", region);

  if (sort === "name") query = query.order("name");

  const { data, error } = await query;

  if (error) console.error("[vendors] fetch error:", error.message);

  let vendors = (data ?? []) as unknown as VendorCardData[];
  vendors = applyPriceFilter(vendors, price);
  vendors = applySort(vendors, sort);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900">강남권 웨딩 업체</h1>

      <div className="mb-4">
        <CategoryTabs currentCategory={category} />
      </div>

      <div className="mb-8 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
        <VendorFilters state={filterState} />
      </div>

      {vendors.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-zinc-500">조건에 맞는 업체가 없어요.</p>
        </div>
      )}
    </main>
  );
}
