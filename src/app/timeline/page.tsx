import WeddingTimeline from "@/components/timeline/WeddingTimeline";

export default function TimelinePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900">웨딩 준비 타임라인</h1>
      <p className="mb-8 text-sm text-zinc-500">
        본식 날짜를 입력하면 스드메 준비 일정을 역산해드려요.
      </p>
      <WeddingTimeline />
    </main>
  );
}
