"use client";

import { useState } from "react";

type Category = "studio" | "dress" | "makeup" | "general";

type Milestone = {
  id: string;
  daysBeforeWedding: number;
  title: string;
  description: string;
  category: Category;
};

const MILESTONES: Milestone[] = [
  {
    id: "studio-contract",
    daysBeforeWedding: 180,
    title: "스튜디오 계약",
    description: "본촬영 날짜·패키지 확정. 인기 스튜디오는 6개월 전부터 마감되는 경우가 많아요.",
    category: "studio",
  },
  {
    id: "dress-contract",
    daysBeforeWedding: 150,
    title: "드레스샵 계약",
    description: "드레스 선택 및 피팅 일정 잡기. 수입 드레스는 수령까지 2~3달 소요.",
    category: "dress",
  },
  {
    id: "makeup-contract",
    daysBeforeWedding: 120,
    title: "메이크업샵 계약",
    description: "본식 헤어·메이크업 상담. 시험 메이크업 일정도 함께 잡아두세요.",
    category: "makeup",
  },
  {
    id: "dress-first-fitting",
    daysBeforeWedding: 120,
    title: "드레스 1차 피팅",
    description: "드레스 수선 방향 결정. 치수에 맞게 조정 시작.",
    category: "dress",
  },
  {
    id: "studio-shoot",
    daysBeforeWedding: 112,
    title: "스튜디오 본촬영",
    description: "청첩장용 웨딩 사진 촬영. 헤어·메이크업 포함 하루 일정.",
    category: "studio",
  },
  {
    id: "photo-selection",
    daysBeforeWedding: 105,
    title: "촬영 사진 선택",
    description: "촬영 후 약 1주일 내 사진 선택. 보정할 컷 수 확정.",
    category: "studio",
  },
  {
    id: "edited-photos",
    daysBeforeWedding: 75,
    title: "보정본 수령",
    description: "사진 선택 후 약 1달 소요. 보정 완료본으로 청첩장 제작 시작.",
    category: "studio",
  },
  {
    id: "invitation-order",
    daysBeforeWedding: 60,
    title: "청첩장 제작 의뢰",
    description: "보정 사진으로 청첩장 디자인·인쇄 의뢰. 제작 기간 약 2주.",
    category: "general",
  },
  {
    id: "invitation-send",
    daysBeforeWedding: 45,
    title: "청첩장 배포",
    description: "본식 6~7주 전 배포 권장. 모바일 청첩장도 함께 발송.",
    category: "general",
  },
  {
    id: "makeup-trial",
    daysBeforeWedding: 30,
    title: "시험 메이크업",
    description: "본식 헤어·메이크업 리허설. 수정 요청 사항 피드백.",
    category: "makeup",
  },
  {
    id: "dress-final-fitting",
    daysBeforeWedding: 14,
    title: "드레스 최종 피팅",
    description: "수선 최종 확인 및 픽업 날짜 조율.",
    category: "dress",
  },
  {
    id: "final-check",
    daysBeforeWedding: 7,
    title: "최종 점검",
    description: "스튜디오·드레스·메이크업 당일 일정 재확인. 반입 물품 체크.",
    category: "general",
  },
];

const CATEGORY_STYLE: Record<Category, { dot: string; badge: string; label: string }> = {
  studio: { dot: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-600", label: "스튜디오" },
  dress: { dot: "bg-rose-500", badge: "bg-rose-50 text-rose-600", label: "드레스" },
  makeup: { dot: "bg-purple-500", badge: "bg-purple-50 text-purple-600", label: "메이크업" },
  general: { dot: "bg-zinc-400", badge: "bg-zinc-100 text-zinc-500", label: "일반" },
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function WeddingTimeline() {
  const [weddingDateStr, setWeddingDateStr] = useState("");

  const weddingDate = weddingDateStr ? new Date(weddingDateStr) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntilWedding = weddingDate ? daysBetween(today, weddingDate) : null;

  return (
    <div>
      {/* 날짜 입력 */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="text-sm font-medium text-zinc-700 sm:w-24">본식 날짜</label>
        <input
          type="date"
          value={weddingDateStr}
          onChange={(e) => setWeddingDateStr(e.target.value)}
          className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
        />
        {daysUntilWedding !== null && (
          <span className="text-sm font-semibold text-zinc-900">
            {daysUntilWedding > 0
              ? `D-${daysUntilWedding}`
              : daysUntilWedding === 0
              ? "오늘이 본식이에요 🎊"
              : `본식 ${Math.abs(daysUntilWedding)}일 후`}
          </span>
        )}
      </div>

      {/* 범례 */}
      {weddingDate && (
        <div className="mb-6 flex flex-wrap gap-2">
          {(Object.entries(CATEGORY_STYLE) as [Category, typeof CATEGORY_STYLE[Category]][]).map(
            ([cat, style]) => (
              <span key={cat} className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
                {style.label}
              </span>
            )
          )}
        </div>
      )}

      {/* 타임라인 */}
      {weddingDate ? (
        <div className="relative">
          {/* 세로선 */}
          <div className="absolute left-3 top-0 h-full w-0.5 bg-zinc-200" />

          <div className="space-y-0">
            {MILESTONES.map((milestone) => {
              const milestoneDate = addDays(weddingDate, -milestone.daysBeforeWedding);
              const isPast = milestoneDate < today;
              const isUrgent =
                !isPast && daysBetween(today, milestoneDate) <= 14;
              const style = CATEGORY_STYLE[milestone.category];

              return (
                <div key={milestone.id} className="relative flex gap-5 pb-8">
                  {/* 점 */}
                  <div
                    className={`relative z-10 mt-0.5 h-7 w-7 flex-shrink-0 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                      isPast ? "bg-zinc-200" : style.dot
                    }`}
                  >
                    {isPast && (
                      <svg className="h-3 w-3 text-zinc-400" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M10 3L5 8.5 2 5.5l-1 1 4 4 6-7z" />
                      </svg>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className={`flex-1 pt-0.5 ${isPast ? "opacity-40" : ""}`}>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-400">
                        {formatDate(milestoneDate)}
                      </span>
                      {isUrgent && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          곧 해야 해요
                        </span>
                      )}
                      {isPast && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-400">
                          지났어요
                        </span>
                      )}
                    </div>
                    <p className={`font-semibold text-zinc-900 ${isPast ? "line-through" : ""}`}>
                      {milestone.title}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500">{milestone.description}</p>
                  </div>
                </div>
              );
            })}

            {/* 본식 */}
            <div className="relative flex gap-5">
              <div className="relative z-10 mt-0.5 h-7 w-7 flex-shrink-0 rounded-full border-2 border-white bg-zinc-900 shadow-sm" />
              <div className="flex-1 pt-0.5">
                <span className="text-xs text-zinc-400">{formatDate(weddingDate)}</span>
                <p className="mt-1 text-lg font-bold text-zinc-900">본식 🎊</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
          <p className="text-zinc-400">본식 날짜를 입력하면 타임라인이 나타나요.</p>
        </div>
      )}
    </div>
  );
}
