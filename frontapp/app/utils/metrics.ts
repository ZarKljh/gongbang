import { MetricsAPI } from "@/app/utils/api";

export type MonthlyVisitorPoint = {
  month: string;
  label: string;
  visitors: number;
};

const monthLabel = (m: number) => `${m}월`;

/**
 * 백엔드에서 월별 방문자 집계 가져오기
 * GET /api/admin/v1/metrics/visitors/monthly?year=YYYY
 * 응답 예: [{ month: "2025-01", visitors: 123 }, ...]
 */
export async function getMonthlyVisitors(
  year = new Date().getFullYear()
): Promise<MonthlyVisitorPoint[]> {
  const rows = await MetricsAPI.monthlyVisitors(year);

  // 라벨("1월" 등) 붙여서 차트용으로 변환
  return (rows ?? []).map((r: { month: string; visitors: number }) => {
    const mm = parseInt(r.month.slice(5, 7), 10); // "YYYY-MM" 기준
    return {
      month: r.month,
      label: Number.isFinite(mm) ? monthLabel(mm) : r.month,
      visitors: Number(r.visitors ?? 0),
    };
  });
}

/**
 * KPI 계산 (이번달, 전월, 전월 대비 %, 연간 합계)
 */
export function calcKPI(data: MonthlyVisitorPoint[], year: number) {
  if (!data.length) {
    return { thisMonth: 0, prevMonth: 0, momPct: 0, yearTotal: 0 };
  }
  const now = new Date();
  const currentMonthIndex = year === now.getFullYear() ? now.getMonth() : 11;
  const thisRow = data[Math.min(currentMonthIndex, data.length - 1)];
  const prevRow =
    data[Math.max(0, Math.min(currentMonthIndex - 1, data.length - 1))];

  const thisMonth = thisRow?.visitors ?? 0;
  const prevMonth = currentMonthIndex > 0 ? prevRow?.visitors ?? 0 : 0;
  const momPct =
    prevMonth > 0 ? ((thisMonth - prevMonth) / prevMonth) * 100 : 0;

  const yearTotal = data.reduce((s, d) => s + (d.visitors || 0), 0);

  return { thisMonth, prevMonth, momPct, yearTotal };
}
