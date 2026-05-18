import Link from "next/link";
import { Database } from "@/types/database";

type Category = Database["public"]["Enums"]["vendor_category"];

const TABS: { label: string; value: Category | null }[] = [
  { label: "전체", value: null },
  { label: "스튜디오", value: "studio" },
  { label: "드레스", value: "dress" },
  { label: "메이크업", value: "makeup" },
];

interface Props {
  currentCategory: Category | null;
}

export default function CategoryTabs({ currentCategory }: Props) {
  return (
    <div className="flex gap-2">
      {TABS.map(({ label, value }) => {
        const isActive = currentCategory === value;
        const href = value ? `/vendors?category=${value}` : "/vendors";

        return (
          <Link
            key={value ?? "all"}
            href={href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
