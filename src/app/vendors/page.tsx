import { createClient } from "@/lib/supabase/server";
import CategoryTabs from "@/components/vendors/CategoryTabs";
import VendorCard, { type VendorCardData } from "@/components/vendors/VendorCard";
import { Database } from "@/types/database";

type Category = Database["public"]["Enums"]["vendor_category"];

const VALID_CATEGORIES: Category[] = ["studio", "dress", "makeup"];

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function VendorsPage({ searchParams }: Props) {
  const { category: rawCategory } = await searchParams;

  const category: Category | null = VALID_CATEGORIES.includes(rawCategory as Category)
    ? (rawCategory as Category)
    : null;

  const supabase = await createClient();

  let query = supabase
    .from("vendors")
    .select(`
      id, name, slug, category, region,
      vendor_stats ( avg_rating, review_count ),
      vendor_images ( url, alt, sort_order ),
      vendor_packages ( price_min, price_max, is_representative )
    `)
    .eq("status", "active")
    .order("name");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[vendors] fetch error:", error.message);
  }

  const vendors = (data ?? []) as unknown as VendorCardData[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900">
        강남권 웨딩 업체
      </h1>

      <div className="mb-8">
        <CategoryTabs currentCategory={category} />
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
