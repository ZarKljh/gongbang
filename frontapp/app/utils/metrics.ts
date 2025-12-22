import { MetricsAPI } from '@/app/utils/api'

export type MonthlyVisitorPoint = {
    month: string // "YYYY-MM"
    label: string // "1월" 등
    visitors: number
}

const monthLabel = (m: number) => `${m}월`

/**
 * 비로그인 방문자 식별자(하루 1회 중복 방지를 위해 재사용)
 * - server component에서는 localStorage 접근 불가 → 반드시 client에서 호출
 */
export function getOrCreateVisitorId(storageKey = 'visitorId'): string {
    if (typeof window === 'undefined') return '' // SSR 방지
    const key = storageKey

    let id = window.localStorage.getItem(key)
    if (!id) {
        id = window.crypto?.randomUUID
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`
        window.localStorage.setItem(key, id)
    }
    return id
}

/**
 * 방문 기록 (하루 1회 정책은 백엔드에서 적용)
 * POST /api/v1/admin/metrics/visit
 *
 * 백엔드 정책:
 * - 로그인: userId + visitedDate 기준 1회
 * - 비로그인: visitorId + visitedDate 기준 1회
 */
export async function recordVisit(params?: {
    path?: string
    referrer?: string | null
    userId?: string | null
    visitorId?: string
}): Promise<void> {
    // client-only 보호
    if (typeof window === 'undefined') return

    const path = params?.path ?? window.location.pathname ?? '/'
    const referrer = params?.referrer ?? (document.referrer ? document.referrer : null)

    const userId = params?.userId ?? null

    // 비로그인인 경우 visitorId 필요
    const visitorId = params?.visitorId ?? (userId ? '' : getOrCreateVisitorId())

    // userId도 없고 visitorId도 없으면 의미 없는 요청이므로 스킵
    if (!userId && !visitorId) return

    // MetricsAPI에 visit 메서드가 있으면 그걸 쓰고,
    // 없으면 fetch로 직접 호출합니다.
    if ((MetricsAPI as any)?.recordVisit) {
        await (MetricsAPI as any).recordVisit({
            path,
            referrer,
            userId,
            visitorId: visitorId || null,
        })
        return
    }

    const res = await fetch('/api/v1/admin/metrics/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            path,
            referrer,
            userId,
            visitorId: visitorId || null,
        }),
    })

    // 백엔드는 void(204)여도 정상. 실패만 잡습니다.
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `recordVisit failed: ${res.status}`)
    }
}

/**
 * 백엔드에서 월별 방문자 집계 가져오기
 * GET /api/v1/admin/metrics/visitors/monthly?year=YYYY
 * 응답 예: [{ month: "2025-01", visitors: 123 }, ...]
 */
export async function getMonthlyVisitors(year = new Date().getFullYear()): Promise<MonthlyVisitorPoint[]> {
    // MetricsAPI.monthlyVisitors()가 실제로 어떤 경로를 치는지 확인 필요
    // (여기서는 MetricsAPI를 신뢰하되, 결과 포맷만 표준화합니다.)
    const rows = await MetricsAPI.monthlyVisitors(year)

    return (rows ?? []).map((r: { month: string; visitors: number }) => {
        const mm = parseInt(r.month.slice(5, 7), 10) // "YYYY-MM"
        return {
            month: r.month,
            label: Number.isFinite(mm) ? monthLabel(mm) : r.month,
            visitors: Number(r.visitors ?? 0),
        }
    })
}

/**
 * KPI 계산 (이번달, 전월, 전월 대비 %, 연간 합계)
 */
export function calcKPI(data: MonthlyVisitorPoint[], year: number) {
    if (!data.length) {
        return { thisMonth: 0, prevMonth: 0, momPct: 0, yearTotal: 0 }
    }

    const now = new Date()
    const currentMonthIndex = year === now.getFullYear() ? now.getMonth() : 11

    const thisRow = data[Math.min(currentMonthIndex, data.length - 1)]
    const prevRow = data[Math.max(0, Math.min(currentMonthIndex - 1, data.length - 1))]

    const thisMonth = thisRow?.visitors ?? 0
    const prevMonth = currentMonthIndex > 0 ? prevRow?.visitors ?? 0 : 0
    const momPct = prevMonth > 0 ? ((thisMonth - prevMonth) / prevMonth) * 100 : 0

    const yearTotal = data.reduce((s, d) => s + (d.visitors || 0), 0)

    return { thisMonth, prevMonth, momPct, yearTotal }
}
