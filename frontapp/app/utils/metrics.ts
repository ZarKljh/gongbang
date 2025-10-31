// app/utils/metrics.ts
export type MonthlyVisitorPoint = {
  month: string; // "2025-01"
  label: string; // "1월"
  visitors: number;
};

const monthLabel = (m: number) => `${m}월`;

// 간단한 시드 난수로 결정론적 데이터 생성 (mock)
export function makeMonthlyMockData(
  year = new Date().getFullYear(),
  months = 12,
  seed = 1234
): MonthlyVisitorPoint[] {
  let x = year * 1103515245 + seed;
  const rand = () => {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return Math.abs(x) % 1000;
  };

  return Array.from({ length: months }, (_, i) => {
    const m = i + 1;
    const monthKey = `${year}-${String(m).padStart(2, "0")}`;
    const base = 3000 + i * 250; // 완만한 상승 트렌드
    const noise = rand(); // 0~999
    return {
      month: monthKey,
      label: monthLabel(m),
      visitors: Math.max(0, base + noise - 500), // 대략 2500~6000
    };
  });
}

// 실제 API 대신 mock 호출처럼 보이게
export async function getMonthlyVisitorsMock(
  year = new Date().getFullYear()
): Promise<MonthlyVisitorPoint[]> {
  const data = makeMonthlyMockData(year, 12);
  await new Promise((r) => setTimeout(r, 250)); // 로딩감
  return data;
}

// KPI 계산 (전월 대비)
export function calcKPI(data: MonthlyVisitorPoint[], year: number) {
  if (!data.length) {
    return { thisMonth: 0, prevMonth: 0, momPct: 0, yearTotal: 0 };
  }
  const now = new Date();
  const currentMonthIndex = year === now.getFullYear() ? now.getMonth() : 11; // 올해는 현재월, 과거/미래는 12월 기준
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
