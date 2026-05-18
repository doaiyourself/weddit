interface Props {
  params: Promise<{ slug: string }>;
}

export default async function VendorDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="flex flex-1 items-center justify-center">
      <p className="text-zinc-500">
        업체 상세 페이지 준비 중 — <span className="font-medium text-zinc-800">{slug}</span>
      </p>
    </main>
  );
}
