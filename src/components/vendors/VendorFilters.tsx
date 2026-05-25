import Link from "next/link";
import { Database } from "@/types/database";

type Category = Database["public"]["Enums"]["vendor_category"];

const REGIONS = ["강남구", "서초구", "송파구"] as const;

const PRICE_RANGES = [
  { label: "~100만", value: "low" },
  { label: "100~300만", value: "mid" },
  { label: "300~500만", value: "high" },
  { label: "500만~", value: "premium" },
] as const;

const SORT_OPTIONS = [
  { label: "이름순", value: "name" },
  { label: "평점순", value: "rating" },
  { label: "후기순", value: "reviews" },
] as const;

export interface FilterState {
  category: Category | null;
  region: string | null;
  price: string | null;
  sort: string;
}

function buildUrl(current: FilterState, changes: Partial<FilterState>): string {
  const merged = { ...current, ...changes };
  const params = new URLSearchParams();
  if (merged.category) params.set("category", merged.category);
  if (merged.region) params.set("region", merged.region);
  if (merged.price) params.set("price", merged.price);
  if (merged.sort && merged.sort !== "name") params.set("sort", merged.sort);
  const query = params.toString();
  return `/vendors${query ? `?${query}` : ""}`;
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-zinc-900 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      }`}
    >
      {children}
    </Link>
  );
}

interface Props {
  state: FilterState;
}

export default function VendorFilters({ state }: Props) {
  return (
    <div className="space-y-3">
      {/* 지역 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-8 text-xs font-medium text-zinc-400">지역</span>
        <Chip href={buildUrl(state, { region: null })} active={!state.region}>
          전체
        </Chip>
        {REGIONS.map((r) => (
          <Chip
            key={r}
            href={buildUrl(state, { region: state.region === r ? null : r })}
            active={state.region === r}
          >
            {r}
          </Chip>
        ))}
      </div>

      {/* 가격대 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-8 text-xs font-medium text-zinc-400">가격</span>
        <Chip href={buildUrl(state, { price: null })} active={!state.price}>
          전체
        </Chip>
        {PRICE_RANGES.map(({ label, value }) => (
          <Chip
            key={value}
            href={buildUrl(state, { price: state.price === value ? null : value })}
            active={state.price === value}
          >
            {label}
          </Chip>
        ))}
      </div>

      {/* 정렬 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-8 text-xs font-medium text-zinc-400">정렬</span>
        {SORT_OPTIONS.map(({ label, value }) => (
          <Chip
            key={value}
            href={buildUrl(state, { sort: value })}
            active={state.sort === value}
          >
            {label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
