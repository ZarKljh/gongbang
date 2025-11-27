'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css'
import detailStyles from '@/app/admin/styles/AdminBusinessDetail.module.css'

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
    studioMainImageUrl?: string
    studioLogoImageUrl?: string
    studioGalleryImageUrls?: string[]
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
    const IMAGE_BASE = '/images/'

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

    const createdLabel = shop.createdAt ? new Date(shop.createdAt).toLocaleString() : '-'

    const hasAnyImage =
        !!shop.studioMainImageUrl ||
        !!shop.studioLogoImageUrl ||
        (shop.studioGalleryImageUrls && shop.studioGalleryImageUrls.length > 0)

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
                        <span className={detailStyles.statusLabel}>현재 상태</span>
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
                <section className={`${styles.card} ${detailStyles.detailCard}`}>
                    <div className={detailStyles.detailLayout}>
                        {/* 왼쪽: 이미지 영역 */}
                        <div className={detailStyles.imageColumn}>
                            <div className={detailStyles.imageSectionHeader}>
                                <h2 className={detailStyles.sectionTitle}>이미지</h2>
                                <p className={detailStyles.sectionSubtitle}>
                                    스튜디오 대표 이미지, 로고, 내부 사진을 확인할 수 있습니다.
                                </p>
                            </div>

                            <div className={detailStyles.mainImageWrapper}>
                                {shop.studioMainImageUrl ? (
                                    <img
                                        src={shop.studioMainImageUrl ? IMAGE_BASE + shop.studioMainImageUrl : undefined}
                                        alt={`${shop.studioName} 대표 이미지`}
                                        className={detailStyles.mainImage}
                                    />
                                ) : (
                                    <div className={detailStyles.mainImagePlaceholder}>대표 이미지가 없습니다.</div>
                                )}

                                {shop.studioLogoImageUrl && (
                                    <div className={detailStyles.logoChip}>
                                        <img
                                            src={shop.studioLogoImageUrl}
                                            alt={`${shop.studioName} 로고`}
                                            className={detailStyles.logoImage}
                                        />
                                        <span className={detailStyles.logoLabel}>로고</span>
                                    </div>
                                )}
                            </div>

                            <div className={detailStyles.galleryWrapper}>
                                <div className={detailStyles.galleryHeader}>
                                    <span className={detailStyles.galleryTitle}>스튜디오 내부 사진</span>
                                    {shop.studioGalleryImageUrls && shop.studioGalleryImageUrls.length > 0 && (
                                        <span className={detailStyles.galleryCount}>
                                            {shop.studioGalleryImageUrls.length}장
                                        </span>
                                    )}
                                </div>

                                {shop.studioGalleryImageUrls && shop.studioGalleryImageUrls.length > 0 ? (
                                    <div className={detailStyles.galleryGrid}>
                                        {shop.studioGalleryImageUrls.map((url, idx) => (
                                            <button
                                                type="button"
                                                key={url + idx}
                                                className={detailStyles.galleryItem}
                                                onClick={() => window.open(url, '_blank')}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`스튜디오 내부 사진 ${idx + 1}`}
                                                    className={detailStyles.galleryImage}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={detailStyles.galleryEmpty}>등록된 내부 사진이 없습니다.</div>
                                )}
                            </div>
                        </div>

                        {/* 오른쪽: 상세 정보 */}
                        <div className={detailStyles.infoColumn}>
                            <div className={detailStyles.sectionHeader}>
                                <h2 className={detailStyles.sectionTitle}>기본 정보</h2>
                            </div>

                            <DetailRow label="스튜디오명">{shop.studioName}</DetailRow>

                            <DetailRow label="스튜디오 이메일">{shop.studioEmail ?? '-'}</DetailRow>

                            <DetailRow label="카테고리">
                                {shop.categoryLabel ?? (shop.categoryId ? `카테고리 #${shop.categoryId}` : '-')}
                            </DetailRow>

                            <DetailRow label="신청자">
                                {shop.ownerUserName ?? '-'}
                                {shop.ownerEmail ? ` (${shop.ownerEmail})` : ''}
                            </DetailRow>

                            <DetailRow label="신청일">{createdLabel}</DetailRow>

                            <div className={detailStyles.sectionDivider} />

                            <div className={detailStyles.sectionHeader}>
                                <h2 className={detailStyles.sectionTitle}>사업자 / 연락처 / 주소</h2>
                            </div>

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
                    <div className={detailStyles.footerRow}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost}`}
                            onClick={() => router.push('/admin/business')}
                        >
                            목록으로 돌아가기
                        </button>

                        <div className={detailStyles.footerActions}>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnDanger}`}
                                disabled={saving || shop.status === 'REJECTED'}
                                onClick={() => updateStatus('REJECTED')}
                            >
                                {saving && statusDraft === 'REJECTED' ? '처리 중...' : '반려'}
                            </button>

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
        <div className={detailStyles.detailRow}>
            <div className={detailStyles.detailLabel}>{label}</div>
            <div className={detailStyles.detailValue}>{children}</div>
        </div>
    )
}
