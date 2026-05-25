"use client";

import { useState } from "react";

export type CategoryStats = {
  min: number;
  max: number;
  avgMin: number;
  count: number;
};

export type PriceData = Partial<Record<"studio" | "dress" | "makeup", CategoryStats>>;

const CATEGORY_LABEL: Record<string, string> = {
  studio: "스튜디오",
  dress: "드레스",
  makeup: "메이크업",
};

function formatPrice(won: number): string {
  if (won >= 10_000_000) return `${(won / 10_000_000).toFixed(0)}천만원`;
  return `${Math.round(won / 10_000)}만원`;
}

interface Props {
  priceData: PriceData;
}

export default function BudgetCalculator({ priceData }: Props) {
  const available = Object.keys(priceData) as (keyof PriceData)[];
  const [selected, setSelected] = useState<Set<keyof PriceData>>(new Set(available));

  function toggle(key: keyof PriceData) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const selectedStats = [...selected]
    .map((k) => priceData[k])
    .filter((s): s is CategoryStats => s != null);

  const totalMin = selectedStats.reduce((sum, s) => sum + s.min, 0);
  const totalAvg = selectedStats.reduce((sum, s) => sum + s.avgMin, 0);
  const totalMax = selectedStats.reduce((sum, s) => sum + s.max, 0);
  const hasSelection = selectedStats.length > 0;

  return (
    <div className="space-y-8">
      {/* 카테고리 선택 */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-700">어떤 업종이 필요하세요?</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {available.map((key) => {
            const stats = priceData[key]!;
            const isOn = selected.has(key);
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  isOn
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                }`}
              >
                <p className="font-semibold">{CATEGORY_LABEL[key]}</p>
                <p className={`mt-1 text-sm ${isOn ? "text-zinc-300" : "text-zinc-400"}`}>
                  {formatPrice(stats.min)} ~ {formatPrice(stats.max)}
                </p>
                <p className={`text-xs ${isOn ? "text-zinc-400" : "text-zinc-300"}`}>
                  강남권 {stats.count}개 업체 기준
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 결과 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        {hasSelection ? (
          <>
            <p className="mb-1 text-sm text-zinc-400">
              {[...selected].map((k) => CATEGORY_LABEL[k]).join(" + ")} 예상 총 비용
            </p>
            <div className="mb-6 flex items-end gap-3">
              <span className="text-3xl font-bold text-zinc-900">
                {formatPrice(totalMin)} ~ {formatPrice(totalMax)}
              </span>
            </div>

            <div className="space-y-3">
              {[...selected].map((key) => {
                const stats = priceData[key];
                if (!stats) return null;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">{CATEGORY_LABEL[key]}</span>
                    <span className="text-sm font-medium text-zinc-800">
                      {formatPrice(stats.min)} ~ {formatPrice(stats.max)}
                    </span>
                  </div>
                );
              })}
              <div className="border-t border-zinc-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700">강남권 평균 합산</span>
                  <span className="text-sm font-semibold text-zinc-900">
                    {formatPrice(totalAvg)}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              * 강남권 실제 업체 데이터 기반 추정값. 선택품목·시즌 할증 미포함.
            </p>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-zinc-400">
            업종을 하나 이상 선택해주세요.
          </p>
        )}
      </section>
    </div>
  );
}
