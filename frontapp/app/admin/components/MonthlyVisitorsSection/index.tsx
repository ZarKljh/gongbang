'use client'

import { useEffect, useState } from 'react'
import { getMonthlyVisitors, calcKPI, type MonthlyVisitorPoint } from '@/app/utils/metrics'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import styles from './MonthlyVisitorsSection.module.css' // 모듈화

type Props = { year: number }

export default function MonthlyVisitorsSection({ year }: Props) {
    const [data, setData] = useState<MonthlyVisitorPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        ;(async () => {
            try {
                const rows = await getMonthlyVisitors(year)
                setData(rows)
            } catch (e: any) {
                setError(e.message || '데이터 불러오기 실패')
            } finally {
                setLoading(false)
            }
        })()
    }, [year])

    if (loading) return <div className={styles.loading}>로딩 중...</div>
    if (error) return <div className={styles.error}>오류: {error}</div>

    const chartData = data.map((d) => ({
        monthLabel: d.label,
        visitors: d.visitors,
    }))

    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <h2>월별 방문자 통계</h2>
                <p>{year}년 방문자 수 (월별)</p>
            </header>

            <div className={styles.chart}>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="monthLabel" tick={{ fill: '#475569' }} />
                        <YAxis tick={{ fill: '#475569' }} />
                        <Tooltip formatter={(v: number) => [`${v}명`, '방문자 수']} />
                        <Area
                            type="monotone"
                            dataKey="visitors"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorVisitors)"
                            dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}
