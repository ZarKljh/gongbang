'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css'

type Role = 'USER' | 'SELLER' | 'ADMIN'
type UserStatus = 'ACTIVE' | 'BAN' | string

type UserDetail = {
    id: number
    userName: string
    fullName?: string
    email: string
    mobilePhone?: string
    nickName?: string
    role: Role
    status?: UserStatus
    gender?: string
    birth?: string
    createdDate?: string
    updatedDate?: string
    studioCount?: number
    orderCount?: number
}

export default function AdminUserDetailPage() {
    const params = useParams()
    const router = useRouter()

    const rawId = params?.id as string | undefined
    const id = rawId ? Number(rawId) : NaN

    const [user, setUser] = useState<UserDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [savingStatus, setSavingStatus] = useState(false)

    const load = async () => {
        if (!rawId || Number.isNaN(id)) {
            setError('잘못된 접근입니다.')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            // baseURL = .../api/v1 이므로 /api/v1 같은 prefix는 붙이지 않음
            const res = await api.get(`/admin/users/${id}`)
            const data: UserDetail = res.data?.data ?? res.data
            setUser(data)
        } catch (e: any) {
            console.error(e)
            setError(e?.response?.data?.message ?? e?.message ?? '유저 정보를 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawId])

    const statusBadgeClass = (status?: UserStatus) => {
        if (!status) return styles.badge

        switch (status) {
            case 'ACTIVE':
                // 프로젝트에 해당 클래스가 없다면 그냥 badge만 적용될 수 있음 (안전)
                return (styles as any).badgeActive ? `${styles.badge} ${(styles as any).badgeActive}` : styles.badge
            case 'BAN':
                return (styles as any).badgeBAN ? `${styles.badge} ${(styles as any).badgeBAN}` : styles.badge
            default:
                return styles.badge
        }
    }

    const updateStatus = async (nextStatus: UserStatus) => {
        if (!user) return
        if (!confirm(`해당 유저의 상태를 '${nextStatus}'(으)로 변경하시겠습니까?`)) return

        try {
            setSavingStatus(true)

            await api.patch(`/admin/users/${user.id}/status`, { status: nextStatus })

            // 성공 시 로컬 상태만 업데이트
            setUser((prev) => (prev ? { ...prev, status: nextStatus } : prev))
        } catch (e: any) {
            console.error(e)
            alert(e?.response?.data?.message ?? e?.message ?? '상태 변경에 실패했습니다.')
        } finally {
            setSavingStatus(false)
        }
    }

    return (
        <div className={styles.page}>
            <Sidebar />

            <main className={styles.main}>
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>유저 상세</h1>
                        <p className={styles.pageSubtitle}>
                            선택한 유저의 상세 정보를 확인하고 상태를 변경할 수 있습니다.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={`${styles.btn} ${styles.btnGhost}`}
                            onClick={() => router.push('/admin/users')}
                        >
                            목록으로
                        </button>
                    </div>
                </div>

                <section className={styles.card}>
                    {loading && <div className={styles.empty}>불러오는 중...</div>}
                    {error && !loading && <div className={(styles as any).errorBox ?? styles.empty}>{error}</div>}

                    {!loading && !error && user && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* 상단 요약 */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 12,
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 600 }}>
                                        {user.fullName ?? user.userName}{' '}
                                        <span style={{ fontSize: 14, color: '#6b7280' }}>({user.userName})</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{user.email}</div>
                                </div>

                                <div
                                    style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}
                                >
                                    <div>
                                        <span style={{ fontSize: 12, color: '#6b7280', marginRight: 6 }}>역할</span>
                                        <span className={(styles as any).roleText ?? ''}>{user.role}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div>
                                            <span style={{ fontSize: 12, color: '#6b7280', marginRight: 6 }}>상태</span>
                                            {user.status ? (
                                                <span className={statusBadgeClass(user.status)}>{user.status}</span>
                                            ) : (
                                                '-'
                                            )}
                                        </div>

                                        {/* ADMIN은 상태 변경 불가 */}
                                        {user.role !== 'ADMIN' && (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {user.status === 'ACTIVE' ? (
                                                    <button
                                                        disabled={savingStatus}
                                                        className={`${styles.btn} ${(styles as any).btnDanger ?? ''}`}
                                                        onClick={() => updateStatus('BAN')}
                                                    >
                                                        {savingStatus ? '처리 중...' : 'BAN 으로 변경'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled={savingStatus}
                                                        className={`${styles.btn} ${(styles as any).btnPrimary ?? ''}`}
                                                        onClick={() => updateStatus('ACTIVE')}
                                                    >
                                                        {savingStatus ? '처리 중...' : 'ACTIVE 로 변경'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0 16px' }} />

                            {/* 기본 정보 */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '150px 1fr',
                                    rowGap: 8,
                                    columnGap: 12,
                                    fontSize: 14,
                                }}
                            >
                                <div style={{ color: '#6b7280' }}>ID</div>
                                <div>{user.id}</div>

                                <div style={{ color: '#6b7280' }}>이름</div>
                                <div>{user.fullName ?? '-'}</div>

                                <div style={{ color: '#6b7280' }}>닉네임</div>
                                <div>{user.nickName ?? '-'}</div>

                                <div style={{ color: '#6b7280' }}>휴대폰</div>
                                <div>{user.mobilePhone ?? '-'}</div>

                                <div style={{ color: '#6b7280' }}>성별</div>
                                <div>{user.gender ?? '-'}</div>

                                <div style={{ color: '#6b7280' }}>생년월일</div>
                                <div>{user.birth ? new Date(user.birth).toLocaleDateString() : '-'}</div>

                                <div style={{ color: '#6b7280' }}>가입일</div>
                                <div>{user.createdDate ? new Date(user.createdDate).toLocaleString() : '-'}</div>

                                <div style={{ color: '#6b7280' }}>수정일</div>
                                <div>{user.updatedDate ? new Date(user.updatedDate).toLocaleString() : '-'}</div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />

                            {/* 통계 */}
                            <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                                <div
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 8,
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#f9fafb',
                                    }}
                                >
                                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>보유 스튜디오</div>
                                    <div style={{ fontSize: 20, fontWeight: 600 }}>{user.studioCount ?? 0} 개</div>
                                </div>

                                <div
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 8,
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#f9fafb',
                                    }}
                                >
                                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>주문 수</div>
                                    <div style={{ fontSize: 20, fontWeight: 600 }}>{user.orderCount ?? 0} 건</div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
