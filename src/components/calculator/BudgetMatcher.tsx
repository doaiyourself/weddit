"use client";

import { useState } from "react";
import Link from "next/link";

export type VendorForMatching = {
  id: string;
  name: string;
  slug: string;
  category: "studio" | "dress" | "makeup";
  region: string;
  priceMin: number;
  priceMax: number;
};

const CATEGORY_LABEL: Record<string, string> = {
  studio: "스튜디오",
  dress: "드레스",
  makeup: "메이크업",
};

const CATEGORIES = ["studio", "dress", "makeup"] as const;
type Category = (typeof CATEGORIES)[number];

function formatPrice(won: number): string {
  return `${Math.round(won / 10_000)}만원`;
}

interface Props {
  vendors: VendorForMatching[];
}

export default function BudgetMatcher({ vendors }: Props) {
  const [selected, setSelected] = useState<Set<Category>>(new Set(CATEGORIES));
  const [budgets, setBudgets] = useState<Record<Category, string>>({
    studio: "",
    dress: "",
    makeup: "",
  });

  function toggle(cat: Category) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function setBudget(cat: Category, value: string) {
    if (value === "" || /^\d+$/.test(value)) {
      setBudgets((prev) => ({ ...prev, [cat]: value }));
    }
  }

  const totalBudget = CATEGORIES.filter((c) => selected.has(c)).reduce((sum, cat) => {
    const val = parseInt(budgets[cat], 10);
    return sum + (isNaN(val) ? 0 : val * 10_000);
  }, 0);

  function getMatches(cat: Category): VendorForMatching[] {
    const val = parseInt(budgets[cat], 10);
    if (isNaN(val) || val <= 0) return [];
    const budget = val * 10_000;
    return vendors.filter((v) => v.category === cat && v.priceMin <= budget);
  }

  const hasAnyBudget = CATEGORIES.some((c) => {
    const val = parseInt(budgets[c], 10);
    return selected.has(c) && !isNaN(val) && val > 0;
  });

  return (
    <div className="space-y-8">
      {/* 입력 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-5 text-base font-semibold text-zinc-800">
          업종별 최대 예산을 입력해주세요
        </h2>
        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-4">
              <button
                onClick={() => toggle(cat)}
                className={`flex h-9 w-24 items-center justify-center rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                  selected.has(cat)
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {CATEGORY_LABEL[cat]}
              </button>

              <div
                className={`flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 transition-opacity ${
                  selected.has(cat)
                    ? "border-zinc-300 opacity-100"
                    : "border-zinc-100 opacity-40"
                }`}
              >
                <input
                  type="number"
                  min={0}
                  placeholder="예산 입력"
                  value={budgets[cat]}
                  onChange={(e) => setBudget(cat, e.target.value)}
                  disabled={!selected.has(cat)}
                  className="flex-1 bg-transparent text-right text-sm text-zinc-900 outline-none placeholder:text-zinc-300 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-sm text-zinc-400">만원</span>
              </div>
            </div>
          ))}
        </div>

        {totalBudget > 0 && (
          <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
            <span className="text-sm text-zinc-500">총 예산</span>
            <span className="text-lg font-bold text-zinc-900">{formatPrice(totalBudget)}</span>
          </div>
        )}
      </section>

      {/* 결과 */}
      {hasAnyBudget && (
        <section className="space-y-6">
          {CATEGORIES.filter((c) => selected.has(c)).map((cat) => {
            const val = parseInt(budgets[cat], 10);
            if (isNaN(val) || val <= 0) return null;
            const matches = getMatches(cat);

            return (
              <div key={cat}>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900">{CATEGORY_LABEL[cat]}</h3>
                  <span className="text-sm text-zinc-400">
                    {matches.length > 0
                      ? `${matches.length}개 업체 매칭`
                      : "예산 내 업체 없음"}
                  </span>
                </div>

                {matches.length > 0 ? (
                  <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    {matches.map((v) => (
                      <Link
                        key={v.id}
                        href={`/vendors/${v.slug}`}
                        className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{v.name}</p>
                          <p className="text-xs text-zinc-400">{v.region}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-zinc-700">
                            {formatPrice(v.priceMin)}
                            {v.priceMax !== v.priceMin && (
                              <span className="text-zinc-400"> ~ {formatPrice(v.priceMax)}</span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-400">→</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-center">
                    <p className="text-sm text-zinc-400">
                      {formatPrice(val * 10_000)} 이내 {CATEGORY_LABEL[cat]} 업체가 없어요.
                    </p>
                    <p className="mt-1 text-xs text-zinc-300">예산을 조금 올려보세요.</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
