"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/utils/api"; // axios 인스턴스 (baseURL, withCredentials 설정)

type Id = string;

export type FaqCategoryRes = {
  id: Id;
  name: string;
  slug: string;
  orderNo: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type FaqRes = {
  id: Id;
  categoryId: Id;
  categoryName: string;
  categorySlug: string;
  question: string;
  answer: string;
  orderNo: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminFaqPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [categories, setCategories] = useState<FaqCategoryRes[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<Id | "all">("all");

  const [rows, setRows] = useState<FaqRes[]>([]);
  const [q, setQ] = useState("");

  const [editing, setEditing] = useState<Partial<FaqRes> | null>(null);
  const [editingCat, setEditingCat] = useState<Partial<FaqCategoryRes> | null>(
    null
  );

  // ✅ 카테고리 관리 모달 열림 상태
  const [catManagerOpen, setCatManagerOpen] = useState(false);

  // -------- Axios-safe 래퍼 --------
  async function safe<T>(
    p: Promise<{ data: any }>,
    fallbackMsg: string
  ): Promise<T> {
    try {
      const { data } = await p;
      return data as T;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || fallbackMsg;
      throw new Error(msg);
    }
  }

  // -------- 로더 --------
  async function loadCategories() {
    const data = await safe<{ content?: FaqCategoryRes[] } | FaqCategoryRes[]>(
      api.get("/api/admin/v1/faq/categories", {
        params: { page: 0, size: 100, sort: "orderNo,asc" },
        withCredentials: true,
      }),
      "카테고리 로드 실패"
    );
    const list = Array.isArray(data) ? data : data.content ?? [];
    setCategories(list);
    if (list.length && selectedCatId === "all") setSelectedCatId(list[0].id);
  }

  async function loadFaqs() {
    const params: any = { page: 0, size: 100 };
    if (selectedCatId !== "all") params.categoryId = String(selectedCatId);
    if (q.trim()) params.q = q.trim();

    const data = await safe<{ content?: FaqRes[] } | FaqRes[]>(
      api.get("/api/admin/v1/faq", { params, withCredentials: true }),
      "FAQ 로드 실패"
    );
    const list = Array.isArray(data) ? data : data.content ?? [];
    setRows(list);
  }

  async function loadAll() {
    setErr(null);
    setLoading(true);
    try {
      await loadCategories();
      await loadFaqs();
    } catch (e: any) {
      setErr(e?.message ?? "로드 실패");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      loadFaqs().catch((e) => setErr(e?.message ?? "로드 실패"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCatId]);

  const selectedCat = useMemo(
    () => categories.find((c) => c.id === selectedCatId),
    [categories, selectedCatId]
  );

  // -------- 액션 (FAQ) --------
  async function onSaveFaq(form: Partial<FaqRes>) {
    const payload = {
      categoryId: form.categoryId,
      question: form.question,
      answer: form.answer,
      orderNo: Number(form.orderNo ?? 0),
      published: Boolean(form.published ?? true),
    };
    if (form.id) {
      await safe(
        api.patch(`/api/admin/v1/faq/${form.id}`, payload, {
          withCredentials: true,
        }),
        "FAQ 수정 실패"
      );
    } else {
      await safe(
        api.post(`/api/admin/v1/faq`, payload, { withCredentials: true }),
        "FAQ 생성 실패"
      );
    }
    await loadFaqs();
    setEditing(null);
  }

  async function onDeleteFaq(id: Id) {
    if (!confirm("이 FAQ를 삭제할까요?")) return;
    await safe(
      api.delete(`/api/admin/v1/faq/${id}`, { withCredentials: true }),
      "FAQ 삭제 실패"
    );
    await loadFaqs();
  }

  async function onTogglePublish(row: FaqRes) {
    await safe(
      api.patch(`/api/admin/v1/faq/${row.id}/publish`, null, {
        params: { value: !row.published },
        withCredentials: true,
      }),
      "공개 상태 변경 실패"
    );
    await loadFaqs();
  }

  // -------- 액션 (카테고리) --------
  async function onSaveCategory(c: Partial<FaqCategoryRes>) {
    const payload = {
      name: c.name,
      slug: c.slug,
      orderNo: Number(c.orderNo ?? 0),
      active: Boolean(c.active ?? true),
    };
    if (c.id) {
      await safe(
        api.patch(`/api/admin/v1/faq/categories/${c.id}`, payload, {
          withCredentials: true,
        }),
        "카테고리 수정 실패"
      );
    } else {
      await safe(
        api.post(`/api/admin/v1/faq/categories`, payload, {
          withCredentials: true,
        }),
        "카테고리 생성 실패"
      );
    }
    await loadCategories();
    // 관리 모달을 계속 열어두고 싶으면 유지
    setCatManagerOpen(true);
    setEditingCat(null);
  }

  async function onDeleteCategory(id: Id) {
    if (
      !confirm(
        "이 카테고리를 삭제할까요? (소속 FAQ가 있다면 이전 후 삭제 권장)"
      )
    )
      return;
    try {
      await api.delete(`/api/admin/v1/faq/categories/${id}`, {
        withCredentials: true,
      });
      await loadCategories();
      setSelectedCatId((prev) => (prev === id ? "all" : prev));
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "카테고리 삭제 실패");
    }
  }

  // -------- UI --------
  return (
    <section className="mx-auto max-w-6xl p-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">FAQ 관리</h1>
          <p className="text-sm text-slate-500">
            카테고리와 FAQ를 추가/수정/삭제할 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="h-9 rounded-lg border px-3"
            onClick={() => setCatManagerOpen(true)}
          >
            카테고리 관리
          </button>
          <button
            className="h-9 rounded-lg border px-3 disabled:opacity-50"
            onClick={() => setEditing({ categoryId: selectedCat?.id })}
            disabled={categories.length === 0}
            title={categories.length === 0 ? "먼저 카테고리를 추가하세요" : ""}
          >
            FAQ 추가
          </button>
        </div>
      </header>

      {err && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
          {err}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="h-9 rounded-lg border bg-white px-3"
          value={selectedCatId}
          onChange={(e) => setSelectedCatId(e.target.value as any)}
        >
          <option value="all">(전체)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.active ? "" : "[비활성] "}
              {c.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <input
            className="h-9 rounded-lg border pl-9 pr-3"
            placeholder="검색: 질문/답변"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadFaqs();
            }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔎
          </span>
        </div>
        <button className="h-9 rounded-lg border px-3" onClick={loadFaqs}>
          검색
        </button>
      </div>

      {/* FAQ 테이블 */}
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">카테고리</th>
              <th className="p-2 text-left">질문</th>
              <th className="p-2">정렬</th>
              <th className="p-2">공개</th>
              <th className="w-36 p-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-center text-slate-500" colSpan={5}>
                  로딩 중…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-slate-500" colSpan={5}>
                  항목이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="whitespace-nowrap p-2">{r.categoryName}</td>
                  <td className="p-2">
                    <div className="line-clamp-2">{r.question}</div>
                  </td>
                  <td className="p-2 text-center">{r.orderNo}</td>
                  <td className="p-2 text-center">
                    <button
                      className={`h-7 rounded-full px-3 text-xs border ${
                        r.published
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-300 bg-slate-50 text-slate-600"
                      }`}
                      onClick={() => onTogglePublish(r)}
                    >
                      {r.published ? "공개" : "비공개"}
                    </button>
                  </td>
                  <td className="p-2 text-right">
                    <button className="px-2" onClick={() => setEditing(r)}>
                      수정
                    </button>
                    <button
                      className="px-2 text-rose-600"
                      onClick={() => onDeleteFaq(r.id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 카테고리 관리 모달 */}
      <CategoryManagerModal
        open={catManagerOpen}
        onClose={() => setCatManagerOpen(false)}
        categories={categories}
        onEdit={(c) => {
          setEditingCat(c || {});
        }}
        onDelete={onDeleteCategory}
      />

      {/* 카테고리 추가/수정 모달 */}
      {editingCat && (
        <CategoryEditor
          value={editingCat}
          onClose={() => setEditingCat(null)}
          onSave={onSaveCategory}
        />
      )}

      {/* FAQ 추가/수정 모달 */}
      {editing && (
        <FaqEditor
          categories={categories}
          value={editing}
          onClose={() => setEditing(null)}
          onSave={onSaveFaq}
        />
      )}
    </section>
  );
}

/* =================== 카테고리 관리 모달 =================== */
function CategoryManagerModal({
  open,
  onClose,
  categories,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  categories: FaqCategoryRes[];
  onEdit: (c?: Partial<FaqCategoryRes>) => void;
  onDelete: (id: Id) => Promise<void>;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold">카테고리 관리</h2>
          <div className="flex items-center gap-2">
            <button
              className="h-8 rounded-lg border px-3 text-sm"
              onClick={() => onEdit({})}
              title="카테고리 추가"
            >
              + 추가
            </button>
            <button
              className="grid h-8 w-8 place-items-center rounded-lg border hover:bg-slate-50"
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[44%] p-2 text-left">이름</th>
                <th className="p-2 text-left">슬러그</th>
                <th className="w-20 p-2 text-center">정렬</th>
                <th className="w-24 p-2 text-center">상태</th>
                <th className="w-36 p-2 text-right">작업</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={5}>
                    등록된 카테고리가 없습니다. “+ 추가”를 눌러 생성하세요.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">
                      <div className="font-medium">{c.name}</div>
                    </td>
                    <td className="p-2 text-slate-600">{c.slug}</td>
                    <td className="p-2 text-center">{c.orderNo}</td>
                    <td className="p-2 text-center">
                      <span
                        className={`inline-flex h-6 items-center rounded-full border px-2 text-xs ${
                          c.active
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-slate-300 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {c.active ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <button className="px-2" onClick={() => onEdit(c)}>
                        수정
                      </button>
                      <button
                        className="px-2 text-rose-600"
                        onClick={() => onDelete(c.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <button className="h-9 rounded-lg border px-3" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/* =================== 카테고리 추가/수정 모달 =================== */
function CategoryEditor({
  value,
  onClose,
  onSave,
}: {
  value: Partial<FaqCategoryRes>;
  onClose: () => void;
  onSave: (form: Partial<FaqCategoryRes>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<FaqCategoryRes>>({
    id: value.id,
    name: value.name ?? "",
    slug: value.slug ?? "",
    orderNo: value.orderNo ?? 0,
    active: value.active ?? true,
  });

  const save = async () => {
    if (!form.name?.trim()) {
      alert("이름을 입력하세요");
      return;
    }
    if (!form.slug?.trim()) {
      alert("슬러그를 입력하세요 (소문자/숫자/하이픈)");
      return;
    }
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">
          {form.id ? "카테고리 수정" : "카테고리 추가"}
        </h2>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-slate-500">이름</label>
            <input
              className="h-10 rounded-lg border px-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 결제"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-slate-500">슬러그</label>
            <input
              className="h-10 rounded-lg border px-3"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="예: payment"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="grid gap-1">
              <label className="text-xs text-slate-500">정렬</label>
              <input
                type="number"
                className="h-9 w-28 rounded-lg border px-2"
                value={form.orderNo as number}
                onChange={(e) =>
                  setForm({ ...form, orderNo: Number(e.target.value) || 0 })
                }
              />
            </div>
            <label className="inline-flex select-none items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              활성화
            </label>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="h-9 rounded-lg border px-3" onClick={onClose}>
            취소
          </button>
          <button
            className="h-9 rounded-lg bg-indigo-600 px-3 text-white"
            onClick={save}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

/* =================== FAQ 추가/수정 모달 =================== */
function FaqEditor({
  categories,
  value,
  onClose,
  onSave,
}: {
  categories: FaqCategoryRes[];
  value: Partial<FaqRes>;
  onClose: () => void;
  onSave: (form: Partial<FaqRes>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<FaqRes>>({
    id: value.id,
    categoryId: value.categoryId ?? categories[0]?.id,
    question: value.question ?? "",
    answer: value.answer ?? "",
    orderNo: value.orderNo ?? 0,
    published: value.published ?? true,
  });

  const save = async () => {
    if (!form.categoryId) {
      alert("카테고리를 선택하세요");
      return;
    }
    if (!form.question?.trim()) {
      alert("질문을 입력하세요");
      return;
    }
    if (!form.answer?.trim()) {
      alert("답변을 입력하세요");
      return;
    }
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">
          {form.id ? "FAQ 수정" : "FAQ 추가"}
        </h2>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-slate-500">카테고리</label>
            <select
              className="h-9 rounded-lg border bg-white px-3"
              value={form.categoryId as string}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-slate-500">질문</label>
            <input
              className="h-10 rounded-lg border px-3"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="질문을 입력하세요"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-slate-500">답변</label>
            <textarea
              className="min-h-[140px] rounded-lg border p-3"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="답변을 입력하세요"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="grid gap-1">
              <label className="text-xs text-slate-500">정렬</label>
              <input
                type="number"
                className="h-9 w-28 rounded-lg border px-2"
                value={form.orderNo as number}
                onChange={(e) =>
                  setForm({ ...form, orderNo: Number(e.target.value) || 0 })
                }
              />
            </div>
            <label className="inline-flex select-none items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.published}
                onChange={(e) =>
                  setForm({ ...form, published: e.target.checked })
                }
              />
              공개
            </label>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="h-9 rounded-lg border px-3" onClick={onClose}>
            취소
          </button>
          <button
            className="h-9 rounded-lg bg-indigo-600 px-3 text-white"
            onClick={save}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
