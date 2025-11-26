// app/admin/business/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css'

type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string

type Shop = {
    id: number
    studioName: string
    studioEmail?: string
    categoryId?: number
    categoryLabel?: string
    ownerUserName?: string
    ownerEmail?: string
    status: SellerStatus
    createdAt?: string
    studioAddPostNumber?: string
    studioBusinessNumber?: string
    studioFax?: string
    studioMobile?: string
    studioOfficeTell?: string
    studioAddDetail?: string
    studioAddMain?: string
}

const statusKoreanLabel = (status: SellerStatus) => {
    switch (status) {
        case 'PENDING':
            return '대기'
        case 'APPROVED':
            return '승인'
        case 'REJECTED':
            return '반려'
        default:
            return status
    }
}

export default function AdminBusinessDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params?.id)

    const [shop, setShop] = useState<Shop | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [saving, setSaving] = useState(false)
    const [statusDraft, setStatusDraft] = useState<SellerStatus>('PENDING')

    const loadDetail = async () => {
        if (!id || Number.isNaN(id)) {
            setError('잘못된 접근입니다.')
            setLoading(false)
            return
        }

        try {
            setError(null)
            setLoading(true)

            const res = await api.get(`/admin/shops/${id}`)
            const data: Shop = Array.isArray(res.data) ? res.data[0] : res.data?.data ?? res.data

            setShop(data)
            setStatusDraft(data.status)
        } catch (e: any) {
            console.error('입점 신청 상세 불러오기 실패:', e)
            setError(e?.response?.data?.message ?? e?.message ?? '상세를 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDetail()
    }, [id])

    const updateStatus = async (nextStatus: SellerStatus) => {
        if (!shop) return
        if (!confirm(`이 신청을 "${statusKoreanLabel(nextStatus)}" 처리할까요?`)) return

        try {
            setSaving(true)
            setError(null)

            await api.patch(`/admin/shops/${shop.id}/status`, {
                status: nextStatus,
            })

            alert(`"${statusKoreanLabel(nextStatus)}" 처리되었습니다.`)
            setStatusDraft(nextStatus)
            setShop((prev) => (prev ? { ...prev, status: nextStatus } : prev))
            router.push('/admin/business')
        } catch (e: any) {
            console.error('상태 변경 실패:', e)
            setError(e?.response?.data?.message ?? e?.message ?? '상태 변경에 실패했습니다.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <Sidebar />
                <main className={styles.main}>
                    <div className={styles.card}>
                        <div className={styles.empty}>불러오는 중...</div>
                    </div>
                </main>
            </div>
        )
    }

    if (error || !shop) {
        return (
            <div className={styles.page}>
                <Sidebar />
                <main className={styles.main}>
                    <div className={styles.card}>
                        <div className={styles.empty}>{error ?? '데이터를 찾을 수 없습니다.'}</div>
                        <button
                            className={`${styles.btn} ${styles.btnGhost}`}
                            onClick={() => router.push('/admin/business')}
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <Sidebar />

            <main className={styles.main}>
                {/* 상단 헤더 */}
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>입점 신청 상세</h1>
                        <p className={styles.pageSubtitle}>
                            스튜디오 정보와 신청자 정보를 확인하고 승인/반려를 처리할 수 있습니다.
                        </p>
                    </div>

                    <div className={styles.filterGroup}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>현재 상태</span>
                        <span
                            className={(() => {
                                switch (shop.status) {
                                    case 'PENDING':
                                        return `${styles.badge} ${styles.badgePending}`
                                    case 'APPROVED':
                                        return `${styles.badge} ${styles.badgeResolved}`
                                    case 'REJECTED':
                                        return `${styles.badge} ${styles.badgeRejected}`
                                    default:
                                        return styles.badge
                                }
                            })()}
                        >
                            {statusKoreanLabel(shop.status)}
                        </span>
                    </div>
                </div>

                {/* 내용 카드 */}
                <section className={styles.card}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* 기본 정보 */}
                        <DetailRow label="스튜디오명">{shop.studioName}</DetailRow>

                        <DetailRow label="스튜디오 이메일">{shop.studioEmail ?? '-'}</DetailRow>

                        <DetailRow label="카테고리">
                            {shop.categoryLabel ?? (shop.categoryId ? `카테고리 #${shop.categoryId}` : '-')}
                        </DetailRow>

                        <DetailRow label="신청자">
                            {shop.ownerUserName ?? '-'}
                            {shop.ownerEmail ? ` (${shop.ownerEmail})` : ''}
                        </DetailRow>

                        <DetailRow label="신청일">
                            {shop.createdAt ? new Date(shop.createdAt).toLocaleString() : '-'}
                        </DetailRow>

                        {/* 사업자/연락처/주소 섹션 */}
                        <div
                            style={{
                                marginTop: 12,
                                paddingTop: 12,
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                            }}
                        >
                            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>사업자 / 연락처 / 주소</h2>

                            <DetailRow label="사업자번호">{shop.studioBusinessNumber || '-'}</DetailRow>

                            <DetailRow label="대표 연락처(휴대폰)">{shop.studioMobile || '-'}</DetailRow>

                            <DetailRow label="대표 연락처(유선)">{shop.studioOfficeTell || '-'}</DetailRow>

                            <DetailRow label="FAX">{shop.studioFax || '-'}</DetailRow>

                            <DetailRow label="우편번호">{shop.studioAddPostNumber || '-'}</DetailRow>

                            <DetailRow label="주소(기본)">{shop.studioAddMain || '-'}</DetailRow>

                            <DetailRow label="주소(상세)">{shop.studioAddDetail || '-'}</DetailRow>
                        </div>
                    </div>

                    {/* 하단 버튼 영역 */}
                    <div
                        style={{
                            marginTop: 24,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost}`}
                            onClick={() => router.push('/admin/business')}
                        >
                            목록으로 돌아가기
                        </button>

                        <div style={{ display: 'flex', gap: 8 }}>
                            {/* 반려 */}
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnDanger}`}
                                disabled={saving || shop.status === 'REJECTED'}
                                onClick={() => updateStatus('REJECTED')}
                            >
                                {saving && statusDraft === 'REJECTED' ? '처리 중...' : '반려'}
                            </button>

                            {/* 승인 */}
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                disabled={saving || shop.status === 'APPROVED'}
                                onClick={() => updateStatus('APPROVED')}
                            >
                                {saving && statusDraft === 'APPROVED' ? '처리 중...' : '승인'}
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
                style={{
                    width: 120,
                    fontSize: 13,
                    color: '#6b7280',
                    flexShrink: 0,
                }}
            >
                {label}
            </div>
            <div style={{ fontSize: 14 }}>{children}</div>
        </div>
    )
}
