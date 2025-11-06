'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import MonthlyVisitorsSection from '@/app/admin/components/MonthlyVisitorsSection'
import { getMonthlyVisitors, calcKPI, type MonthlyVisitorPoint } from '@/app/utils/metrics'
import { fetchPendingCounts, type PendingCounts } from '@/app/utils/adminQuickAccess'
import styles from '@/app/admin/styles/MySection.module.css'

export default function AdminDashboard() {
    const [data, setData] = useState<MonthlyVisitorPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ✅ 하단 빠른 액세스용 미처리 건수 상태
    const [pending, setPending] = useState<PendingCounts>({
        shop: 0,
        report: 0,
        inquiry: 0,
    })

    // 방문자 데이터 로드
    useEffect(() => {
        ;(async () => {
            try {
                const rows = await getMonthlyVisitors()
                setData(rows)
            } catch (e: any) {
                setError(e.message || '데이터 불러오기 실패')
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    // ✅ 신고/문의 미처리 건수 3초 폴링
    useEffect(() => {
        let cancelled = false

        const loadPending = async () => {
            try {
                const result = await fetchPendingCounts()
                if (!cancelled) {
                    setPending(result)
                }
            } catch (e) {
                console.error('미처리 건수 불러오기 실패:', e)
            }
        }

        // 처음 한 번
        loadPending()

        // 3초마다 폴링
        const id = setInterval(loadPending, 3000)

        return () => {
            cancelled = true
            clearInterval(id)
        }
    }, [])

    const kpi = calcKPI(data, new Date().getFullYear())

    return (
        <div className={styles.dashboardLayout}>
            {/* 사이드바 */}
            <Sidebar />

            {/* 메인 영역 */}
            <main className={styles.mainArea}>
                {/* 차트 + KPI */}
                <section className={styles.chartArea}>
                    <div className={styles.chartLeft}>
                        <MonthlyVisitorsSection year={new Date().getFullYear()} />
                    </div>

                    <div className={styles.chartRight}>
                        <div className={styles.kpiBox}>
                            <div className={styles.kpiItem}>
                                <span>이번 달</span>
                                <span className={styles.kpiItemDesign}></span>
                                <strong>{kpi.thisMonth.toLocaleString()}</strong>
                            </div>
                            <div className={styles.kpiItem}>
                                <span>저번 달</span>
                                <span className={styles.kpiItemDesign}></span>
                                <strong>{kpi.prevMonth.toLocaleString()}</strong>
                            </div>
                            <div className={`${styles.kpiItem} ${kpi.momPct >= 0 ? styles.up : styles.down}`}>
                                <span>전월 대비</span>
                                <span className={styles.kpiItemDesign}></span>
                                <strong>
                                    {kpi.momPct >= 0 ? '+' : ''}
                                    {kpi.momPct.toFixed(1)}%
                                </strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 하단 빠른 액세스 */}
                <section className={styles.bottomDashboard}>
                    <div className={styles.bottomTitle}>빠른 액세스</div>
                    <div className={styles.bottomGrid}>
                        {/* 입점 신청: 사업자/입점 관련 문의 카운트 */}
                        <button className={`${styles.circleCard} ${styles.cardShop}`}>
                            <span className={styles.cardTitle}>입점 신청</span>
                            <span className={styles.cardDivider}></span>
                            <span className={styles.cardSubText}>미처리 {pending.shop.toLocaleString()}건</span>
                        </button>

                        {/* 신고 관리: ReportController 의 pending count */}
                        <button className={`${styles.circleCard} ${styles.cardReport}`}>
                            <span className={styles.cardTitle}>신고 관리</span>
                            <span className={styles.cardDivider}></span>
                            <span className={styles.cardSubText}>미처리 {pending.report.toLocaleString()}건</span>
                        </button>

                        {/* 문의 신청: 일반 문의 */}
                        <button className={`${styles.circleCard} ${styles.cardInquiry}`}>
                            <span className={styles.cardTitle}>문의 신청</span>
                            <span className={styles.cardDivider}></span>
                            <span className={styles.cardSubText}>미처리 {pending.inquiry.toLocaleString()}건</span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    )
}
