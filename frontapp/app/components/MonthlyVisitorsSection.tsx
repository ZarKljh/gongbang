"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getMonthlyVisitorsMock,
  calcKPI,
  type MonthlyVisitorPoint,
} from "@/app/utils/metrics";

type Props = { initialYear?: number };

export default function MonthlyVisitorsSection({ initialYear }: Props) {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(initialYear ?? thisYear);
  const [rows, setRows] = useState<MonthlyVisitorPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await getMonthlyVisitorsMock(year);
        if (mounted) setRows(data);
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "데이터를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [year]);

  const { thisMonth, prevMonth, momPct, yearTotal } = useMemo(
    () => calcKPI(rows, year),
    [rows, year]
  );

  return (
    <section className="md:col-span-3 rounded-2xl border bg-white">
      {/* 헤더 + 연도 선택 */}
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <div className="text-base font-semibold">월별 방문자수</div>
          <div className="mt-1 text-sm text-slate-500">
            {year}년 누적 방문:{" "}
            <span className="font-medium">{yearTotal.toLocaleString()} 명</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">연도</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 rounded-xl border px-3 text-sm bg-white"
          >
            {[thisYear, thisYear - 1, thisYear - 2, thisYear - 3].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 상단 KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 pt-4">
        <div className="rounded-2xl border p-4">
          <div className="text-xs text-slate-500">이번달 방문자</div>
          <div className="mt-1 text-xl font-semibold">
            {loading ? "—" : thisMonth.toLocaleString()} 명
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-xs text-slate-500">전월</div>
          <div className="mt-1 text-xl font-semibold">
            {loading ? "—" : prevMonth.toLocaleString()} 명
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-xs text-slate-500">전월 대비</div>
          <div
            className={`mt-1 text-xl font-semibold ${
              momPct > 0
                ? "text-emerald-600"
                : momPct < 0
                ? "text-rose-600"
                : ""
            }`}
          >
            {loading ? "—" : `${momPct.toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="p-5 pt-0">
        {err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        ) : loading ? (
          <div className="h-56 grid place-items-center text-sm text-slate-500">
            로딩 중…
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={rows}
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={52} />
                <Tooltip
                  formatter={(v: any) => [
                    `${Number(v).toLocaleString()} 명`,
                    "방문자수",
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#6366f1"
                  fill="url(#visitorsGrad)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
