import { createClient } from "@/lib/supabase/server";
import BudgetMatcher, { type VendorForMatching } from "@/components/calculator/BudgetMatcher";

export default async function CalculatorPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vendors")
    .select(`
      id, name, slug, category, region,
      vendor_packages ( price_min, price_max, is_representative )
    `)
    .eq("status", "active");

  const vendors: VendorForMatching[] = (data ?? []).flatMap((v) => {
    const pkgs = v.vendor_packages as { price_min: number; price_max: number; is_representative: boolean }[];
    const rep = pkgs.find((p) => p.is_representative) ?? pkgs[0];
    if (!rep) return [];
    return [{
      id: v.id,
      name: v.name,
      slug: v.slug,
      category: v.category as VendorForMatching["category"],
      region: v.region,
      priceMin: rep.price_min,
      priceMax: rep.price_max,
    }];
  });

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900">예산 계산기</h1>
      <p className="mb-8 text-sm text-zinc-500">
        예산을 입력하면 그 안에서 선택할 수 있는 업체를 찾아드려요.
      </p>
      <BudgetMatcher vendors={vendors} />
    </main>
  );
}
