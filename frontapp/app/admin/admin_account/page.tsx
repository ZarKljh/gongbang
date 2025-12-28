'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import MonthlyVisitorsSection from '@/app/admin/components/MonthlyVisitorsSection'
import { calcKPI, type MonthlyVisitorPoint } from '@/app/utils/metrics'
import styles from '@/app/admin/styles/MySection.module.css'
import RecentUsersCard from '@/app/admin/components/RecentUsersCard'
import RecentSellerCard from '@/app/admin/components/RecentSellerCard'
import Link from 'next/link'

import { api } from '@/app/utils/api'

type PendingCounts = {
    shop: number
    report: number
    inquiry: number
}

export default function AdminDashboard() {
    const year = new Date().getFullYear()

    // ✅ 팀장 룰: baseURL을 여기서 뽑아서 모든 호출에 사용
    const API_BASE_URL = (api.defaults.baseURL ?? '').replace(/\/$/, '')

    const [data, setData] = useState<MonthlyVisitorPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [pending, setPending] = useState<PendingCounts>({
        shop: 0,
        report: 0,
        inquiry: 0,
    })

    // ✅ 방문자 데이터 로드 (api + API_BASE_URL)
    useEffect(() => {
        let cancelled = false

        ;(async () => {
            try {
                setError(null)

                const res = await api.get(`${API_BASE_URL}/admin/metrics/visitors/monthly`, {
                    params: { year },
                })

                const rows = (res.data?.data ?? res.data) as Array<{ month: string; visitors: number }>
                const mapped = rows.map((r) => ({
                    month: r.month,
                    visitors: r.visitors,
                })) as MonthlyVisitorPoint[]

                if (!cancelled) setData(mapped)
            } catch (e: any) {
                if (!cancelled) setError(e?.response?.data?.message ?? e?.message ?? '데이터 불러오기 실패')
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [API_BASE_URL, year])

    // ✅ 미처리 건수 폴링 (shop / inquiry / report)
    useEffect(() => {
        let cancelled = false

        const loadPending = async () => {
            try {
                const [shopRes, inquiryRes, reportRes] = await Promise.all([
                    api.get(`${API_BASE_URL}/admin/shops`, { params: { status: 'PENDING' } }),
                    api.get(`${API_BASE_URL}/admin/inquiries`, { params: { status: 'PENDING' } }),
                    api.get(`${API_BASE_URL}/admin/reports`, { params: { status: 'PENDING' } }),
                ])

                const shopList = (shopRes.data?.data ?? shopRes.data) as any[]
                const inquiryList = (inquiryRes.data?.data ?? inquiryRes.data) as any[]
                const reportList = (reportRes.data?.data ?? reportRes.data) as any[]

                const shop = Array.isArray(shopList) ? shopList.length : 0
                const inquiry = Array.isArray(inquiryList) ? inquiryList.length : 0
                const report = Array.isArray(reportList) ? reportList.length : 0

                if (!cancelled) setPending({ shop, inquiry, report })
            } catch (e) {
                console.error('미처리 건수 불러오기 실패:', e)
            }
        }

        loadPending()
        const id = setInterval(loadPending, 3000)

        return () => {
            cancelled = true
            clearInterval(id)
        }
    }, [API_BASE_URL])

    const kpi = calcKPI(data, year)

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />

            <main className={styles.mainArea}>
                <section className={styles.chartArea}>
                    <div className={styles.chartLeft}>
                        <MonthlyVisitorsSection year={year} />
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

                        {/* 필요하면 사용 (원래 주석 유지) */}
                        {/* {loading && <div>로딩중...</div>}
                        {error && <div>{error}</div>} */}
                    </div>
                </section>

                <section className={styles.bottomsection}>
                    <div className={styles.bottomLeft}>
                        <RecentUsersCard limit={6} />
                    </div>

                    <div>
                        <RecentSellerCard title="최근 입점 신청" limit={6} pollMs={5000} />
                    </div>

                    <div className={styles.bottomright}>
                        <div className={styles.bottomTitle}>빠른 액세스</div>
                        <div className={styles.bottomGrid}>
                            <Link className={`${styles.circleCard} ${styles.cardShop}`} href="/admin/business">
                                <span className={styles.cardTitle}>입점 신청</span>
                                <span className={styles.cardDivider}></span>
                                <span className={styles.cardSubText}>미처리 {pending.shop.toLocaleString()}건</span>
                            </Link>

                            <Link className={`${styles.circleCard} ${styles.cardReport}`} href="/admin/admin_reports">
                                <span className={styles.cardTitle}>신고 관리</span>
                                <span className={styles.cardDivider}></span>
                                <span className={styles.cardSubText}>미처리 {pending.report.toLocaleString()}건</span>
                            </Link>

                            <Link className={`${styles.circleCard} ${styles.cardInquiry}`} href="/admin/inquiries">
                                <span className={styles.cardTitle}>문의 신청</span>
                                <span className={styles.cardDivider}></span>
                                <span className={styles.cardSubText}>미처리 {pending.inquiry.toLocaleString()}건</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
