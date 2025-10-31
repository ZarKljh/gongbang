import Link from "next/link";
import ClientNav from "@/app/components/ClientNav";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_ADMIN_API ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:8090"; // 로컬 기본값

// ----- Types -----
type PubFaqCategory = {
  id: string;
  name: string;
  slug: string;
  orderNo: number;
  active: boolean;
};

type PubFaq = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  question: string;
  answer: string;
  orderNo: number;
  published: boolean;
};

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_ORIGIN}${path}`;
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Fetch failed ${res.status}: ${url} :: ${body}`);
  }
  return res.json();
}

export default async function FaqPublicPage({
  searchParams,
}: {
  // ✅ Next 14.2+/15에서는 searchParams가 Promise로 들어옵니다.
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1) 카테고리 로드
  const cats = await fetchJSON<PubFaqCategory[]>(`/api/v1/faq/categories`);
  const activeCats = cats.filter((c) => c.active);

  // 2) URL 쿼리 파라미터 (SSR) – 반드시 await
  const sp = await searchParams;
  const selectedCatId =
    (typeof sp?.categoryId === "string" ? sp.categoryId : undefined) ||
    activeCats[0]?.id;

  // 3) FAQ 로드
  const qs = new URLSearchParams();
  if (selectedCatId) qs.set("categoryId", selectedCatId);
  qs.set("page", "0");
  qs.set("size", "100");

  const faqsPage = await fetchJSON<{ content?: PubFaq[] } | PubFaq[]>(
    `/api/v1/faq?${qs.toString()}`
  );
  const faqs: PubFaq[] = Array.isArray(faqsPage)
    ? faqsPage
    : faqsPage.content ?? [];

  return (
    <section className="max-w-3xl mx-auto p-6">
      <h1 className="mb-4 text-2xl font-semibold">자주 묻는 질문 (FAQ)</h1>

      {/* Category tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {activeCats.length === 0 ? (
          <span className="text-sm text-slate-500">
            활성화된 카테고리가 없습니다.
          </span>
        ) : (
          activeCats.map((c) => (
            <Link
              key={c.id}
              href={`/support/faq?categoryId=${c.id}`}
              className={`inline-flex h-9 items-center rounded-full border px-3 text-sm ${
                selectedCatId === c.id
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "bg-white"
              }`}
              prefetch
            >
              {c.name}
            </Link>
          ))
        )}
      </div>

      {/* FAQ list (accordion) */}
      <ul className="divide-y rounded-xl border">
        {faqs.length === 0 ? (
          <li className="p-4 text-slate-500">등록된 FAQ가 없습니다.</li>
        ) : (
          faqs.map((f) => (
            <li key={f.id} className="p-4">
              <details>
                <summary className="cursor-pointer font-medium">
                  {f.question}
                </summary>
                <div className="mt-2 whitespace-pre-wrap text-slate-600">
                  {f.answer}
                </div>
              </details>
            </li>
          ))
        )}
      </ul>

      <div className="mt-8 text-sm text-slate-500">
        원하는 답이 없나요? <ClientNav />
      </div>
    </section>
  );
}
