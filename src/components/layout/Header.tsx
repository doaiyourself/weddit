import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-zinc-900"
        >
          웨딧
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/vendors"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            업체 찾기
          </Link>
          <Link
            href="/calculator"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            예산 계산기
          </Link>
          <Link
            href="/timeline"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            타임라인
          </Link>
        </nav>
      </div>
    </header>
  );
}
