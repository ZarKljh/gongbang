"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminAPI, type AdminMe, type InquiryType } from "@/app/utils/api";
import MonthlyVisitorsSection from "@/app/components/MonthlyVisitorsSection";
import Link from "next/link";

export default function AdminPage() {
  // ── 공통: 관리자 정보 ──────────────────────────────────────────────
  const [me, setMe] = useState<AdminMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminAPI.me();
      setMe(data);
    } catch (e: any) {
      setError(e?.message ?? "불명확한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 문의(Inquiry) 알림 ──────────────────────────────────────────────
  const [activeType, setActiveType] = useState<InquiryType>("USER");

  const [inqCount, setInqCount] = useState<number>(0);
  const [inqHasNew, setInqHasNew] = useState(false);
  const inqBaselineRef = useRef<number>(0);
  const getInqBaselineKey = (t: InquiryType) => `inqAckBaseline:${t}`;

  useEffect(() => {
    const saved = Number(localStorage.getItem(getInqBaselineKey(activeType)));
    inqBaselineRef.current = Number.isFinite(saved) ? saved : 0;
  }, [activeType]);

  const fetchInquiryCount = useCallback(async () => {
    try {
      const nextCount = await AdminAPI.inquiryCount(activeType);
      if (!Number.isFinite(nextCount)) return;

      setInqCount(nextCount);
      setInqHasNew(nextCount > inqBaselineRef.current);
    } catch {
      /* noop */
    }
  }, [activeType]);

  const acknowledgeInquiries = useCallback(async () => {
    try {
      await AdminAPI.acknowledgeInquiries(activeType);
      setInqCount(0);
      setInqHasNew(false);
      inqBaselineRef.current = 0;
      localStorage.setItem(getInqBaselineKey(activeType), "0");
    } finally {
      /* noop */
    }
  }, [activeType]);

  // ── 신고(Report) 알림 ──────────────────────────────────────────────
  const [repCount, setRepCount] = useState<number>(0);
  const [repHasNew, setRepHasNew] = useState(false);
  const repBaselineRef = useRef<number>(0);
  const getReportBaselineKey = () => `reportAckBaseline`;

  useEffect(() => {
    const saved = Number(localStorage.getItem(getReportBaselineKey()));
    repBaselineRef.current = Number.isFinite(saved) ? saved : 0;
  }, []);

  const fetchReportCount = useCallback(async () => {
    try {
      const nextCount = await AdminAPI.reportCount();
      if (!Number.isFinite(nextCount)) return;

      setRepCount(nextCount);
      setRepHasNew(nextCount > repBaselineRef.current);
    } catch {
      /* noop */
    }
  }, []);

  const acknowledgeReports = useCallback(async () => {
    try {
      await AdminAPI.acknowledgeReports();
    } finally {
      setRepCount(0);
      setRepHasNew(false);
      repBaselineRef.current = 0;
      localStorage.setItem(getReportBaselineKey(), "0");
    }
  }, []);

  // ── 통합 벨(뱃지 1개) ─────────────────────────────────────────────
  const [openNotice, setOpenNotice] = useState(false);
  const bellWrapRef = useRef<HTMLDivElement | null>(null);

  const totalCount = inqCount + repCount;
  const anyHasNew = inqHasNew || repHasNew;

  const toggleNotice = useCallback(() => setOpenNotice((v) => !v), []);

  // 바깥 클릭/ESC 닫기
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!openNotice) return;
      const el = bellWrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpenNotice(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenNotice(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openNotice]);

  // ── 초기 로드 & 폴링 ───────────────────────────────────────────────
  useEffect(() => {
    loadMe();
    fetchInquiryCount();
    fetchReportCount();
  }, [loadMe, fetchInquiryCount, fetchReportCount]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchInquiryCount();
      fetchReportCount();
    }, 3000);
    return () => clearInterval(id);
  }, [fetchInquiryCount, fetchReportCount]);

  // 표시용
  const displayName = useMemo(() => me?.name?.trim() || "관리자", [me]);
  const displayRole = useMemo(() => me?.role?.trim() || "관리자", [me]);

  // ── 렌더 ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
          <div className="font-semibold">관리자 대시보드</div>

          <div className="ml-auto flex items-center gap-2">
            {/* 검색 */}

            <form action="" className="hidden sm:flex items-center gap-2">
              <input
                name="q"
                placeholder="검색 (이메일, 이름)"
                className="h-9 w-56 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button className="h-9 rounded-xl border px-3 text-sm">
                검색
              </button>
            </form>
            <Link
              href="/admin/admin_account/faq"
              className="h-9 rounded-lg border px-3 inline-flex items-center hover:bg-slate-50"
            >
              FAQ 관리하기
            </Link>

            {/* 통합 벨(문의+신고) */}
            <div ref={bellWrapRef} className="relative">
              <button
                type="button"
                onClick={toggleNotice}
                aria-haspopup="true"
                aria-expanded={openNotice}
                aria-controls="unified-popover"
                title={
                  anyHasNew
                    ? "새 알림 도착!"
                    : totalCount > 0
                    ? `미처리/미확인 ${totalCount}건`
                    : "새 알림 없음"
                }
                className="relative h-9 w-9 rounded-xl border bg-white text-slate-700 grid place-items-center hover:bg-slate-50"
              >
                <span aria-hidden>🔔</span>

                {anyHasNew && (
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] leading-none grid place-items-center shadow">
                    +
                  </span>
                )}
                {totalCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full border text-xs bg-indigo-600 text-white grid place-items-center">
                    {totalCount}
                  </span>
                )}
              </button>

              {openNotice && (
                <div
                  id="unified-popover"
                  role="status"
                  aria-live="polite"
                  className="absolute right-0 mt-2 w-[22rem] rounded-2xl border bg-white shadow-lg ring-1 ring-black/5 p-4 text-sm"
                >
                  <div className="font-medium mb-2">알림</div>

                  {/* 문의 섹션 */}
                  <div className="rounded-xl border p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">문의</div>
                      <span
                        className={`inline-flex items-center rounded-full border text-xs px-2 py-0.5 ${
                          inqCount > 0
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        {inqHasNew ? "신규" : "현황"} · {inqCount}건
                      </span>
                    </div>
                    <div className="mt-1 text-slate-600">
                      {inqHasNew
                        ? "새로운 문의가 도착했습니다"
                        : "현재 미확인 현황"}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={acknowledgeInquiries}
                        className="h-8 px-3 rounded-xl bg-slate-900 text-white text-xs hover:bg-slate-800"
                      >
                        문의 확인하기
                      </button>
                    </div>
                  </div>

                  {/* 신고 섹션 */}
                  <div className="rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">신고</div>
                      <span
                        className={`inline-flex items-center rounded-full border text-xs px-2 py-0.5 ${
                          repCount > 0
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        {repHasNew ? "신규" : "현황"} · {repCount}건
                      </span>
                    </div>
                    <div className="mt-1 text-slate-600">
                      {repHasNew
                        ? "새로운 신고가 도착했습니다"
                        : "현재 미처리 현황"}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={acknowledgeReports}
                        className="h-8 px-3 rounded-xl bg-slate-900 text-white text-xs hover:bg-slate-800"
                      >
                        신고 확인하기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 프로필 새로고침 */}
            <button
              onClick={loadMe}
              className="h-9 rounded-xl border px-3 text-sm"
            >
              새로고침
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-3">
        {/* 프로필 */}

        <MonthlyVisitorsSection initialYear={new Date().getFullYear()} />
        <section className="md:col-span-2 rounded-2xl border bg-white">
          <div className="p-5 border-b">
            <div className="text-base font-semibold">프로필</div>
            <div className="mt-1 text-sm text-slate-500">
              현재 로그인된 관리자 정보입니다.
            </div>
          </div>
          <div className="p-5">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : loading ? (
              <div className="animate-pulse">
                <div className="h-6 w-40 rounded bg-slate-200" />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 rounded bg-slate-200" />
                  ))}
                </div>
              </div>
            ) : me ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="size-16 rounded-2xl grid place-items-center bg-slate-100 text-slate-600 text-base font-semibold">
                  {displayName.slice(0, 2)}
                </div>
                <div className="space-y-4 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-semibold">{displayName}</span>
                    <span className="inline-flex items-center text-xs rounded-full border px-2 py-1 text-slate-600 bg-slate-50">
                      {displayRole}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border p-3">
                      <div className="text-slate-500">관리자 ID</div>
                      <div className="font-medium">{me.id}</div>
                    </div>
                    <div className="rounded-2xl border p-3">
                      <div className="text-slate-500">이메일</div>
                      <div className="font-medium break-all">{me.email}</div>
                    </div>
                    <div className="rounded-2xl border p-3">
                      <div className="text-slate-500">이름</div>
                      <div className="font-medium">{displayName}</div>
                    </div>
                    <div className="rounded-2xl border p-3">
                      <div className="text-slate-500">권한</div>
                      <div className="font-medium">{displayRole}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border p-3 bg-slate-50 text-xs text-slate-600">
                    {[me.id, displayName, me.email].join(", ")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">데이터가 없습니다.</div>
            )}
          </div>
        </section>

        {/* 시스템 상태 */}
        <section className="rounded-2xl border bg-white">
          <div className="p-5 border-b">
            <div className="text-base font-semibold">시스템 상태</div>
            <div className="mt-1 text-sm text-slate-500">
              기본 점검 항목 (예시)
            </div>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>API 연결</span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-1">
                {error ? "오류" : loading ? "확인중" : "정상"}
              </span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex items-center justify-between">
              <span>문의 알림</span>
              <span
                className={`inline-flex items-center rounded-full border text-xs px-2 py-1 ${
                  inqCount > 0
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-slate-50 text-slate-700"
                }`}
              >
                {inqCount} 건 {inqHasNew && <span className="ml-1">(+)</span>}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>신고 알림</span>
              <span
                className={`inline-flex items-center rounded-full border text-xs px-2 py-1 ${
                  repCount > 0
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-slate-50 text-slate-700"
                }`}
              >
                {repCount} 건 {repHasNew && <span className="ml-1">(+)</span>}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-500">
        <hr className="my-6 border-slate-200" />
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Admin Console</span>
          <span className="mx-1">·</span>
          <span>통합 알림 뱃지 + 문의/신고 패널</span>
        </div>
      </footer>
    </div>
  );
}
