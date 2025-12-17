'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

import styles from '@/app/layout.module.css'
import AdminNavButton from '@/app/admin/components/AdminNavButton'
import 로고 from '@/public/images/Logo.png'
import api from '@/app/utils/api'
import bellIcon from '@/public/images/bell_11984251.png'

// 로그인 유저 타입
type MeUser = {
    id: number
    userName: string
    role: string
}

type Category = {
    id: number
    name: string
}

type SubCategory = {
    id: number
    name: string
    categoryId: number
}

// RsData 공통 응답 타입
type RsData<T> = {
    resultCode: string
    msg: string
    data: T
}

// 알림 타입
type NotificationItem = {
    id: number
    message: string
    link: string | null
    isRead: boolean
    createdAt: string
}

export default function MainNav() {
    const [user, setUser] = useState<MeUser | null>(null)
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()
    const router = useRouter()

    const [categories, setCategories] = useState<Category[]>([])
    const [subCategoriesByCat, setSubCategoriesByCat] = useState<Record<number, SubCategory[]>>({})
    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
    const [openMobileCategoryId, setOpenMobileCategoryId] = useState<number | null>(null)

    const hideCategorySection = pathname === '/product/list'

    // ================== 알림 상태 ==================
    const [isAlarmOpen, setIsAlarmOpen] = useState(false)
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const alarmRef = useRef<HTMLDivElement | null>(null)

    // createdAt: 날짜만 보여주기 (YYYY-MM-DD)
    const formatDate = (iso: string) => {
        const d = new Date(iso)
        if (Number.isNaN(d.getTime())) return iso?.slice(0, 10) ?? ''
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    // 절대 URL이 와도 pathname+search로 변환해서 router.push 가능하게
    const toAppPath = (raw: string) => {
        try {
            const u = new URL(raw)
            return `${u.pathname}${u.search}`
        } catch {
            return raw
        }
    }

    // ================== 로그인 상태 확인 ==================
    const checkLogin = async () => {
        try {
            const res = await fetch('http://localhost:8090/api/v1/auth/me', {
                method: 'GET',
                credentials: 'include',
            })

            if (!res.ok) {
                setUser(null)
                return
            }

            const data = (await res.json()) as RsData<MeUser | null>

            if (data.resultCode?.startsWith('200') && data.data) {
                setUser(data.data)
            } else {
                setUser(null)
            }
        } catch (e) {
            console.error('로그인 상태 확인 실패:', e)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkLogin()
        setIsHamburgerOpen(false)
        setIsAlarmOpen(false)
    }, [pathname])

    const isLoggedIn = !!user

    // ================== 카테고리 / 세부 카테고리 로드 ==================
    const fetchCategoriesAndSubs = async () => {
        try {
            const res = await api.get('/category')
            const categoryList: Category[] = res.data.data.categoryList
            setCategories(categoryList)

            const subPromises = categoryList.map(async (cat) => {
                const res = await api.get(`/category/${cat.id}/sub`)
                const subs: SubCategory[] = res.data.data.subCategoryList
                return [cat.id, subs] as const
            })

            const results = await Promise.all(subPromises)

            const subMap: Record<number, SubCategory[]> = {}
            results.forEach(([catId, subs]) => {
                subMap[catId] = subs
            })

            setSubCategoriesByCat(subMap)
        } catch (err) {
            console.error('카테고리/세부카테고리 로드 실패:', err)
        }
    }

    useEffect(() => {
        fetchCategoriesAndSubs()
    }, [])

    // ================== 알림 API ==================
    const fetchUnreadCount = async () => {
        try {
            const res = await api.get<RsData<number>>('/notifications/unread-count')
            if (res.data.resultCode?.startsWith('200')) {
                setUnreadCount(res.data.data ?? 0)
            }
        } catch (e) {
            console.error('미확인 알림 개수 로드 실패:', e)
        }
    }

    const fetchNotifications = async () => {
        try {
            const res = await api.get<RsData<NotificationItem[]>>('/notifications')
            if (res.data.resultCode?.startsWith('200')) {
                const list = res.data.data ?? []
                // ✅ "삭제처럼 보이게" = 안 읽은 알림만 보여주기
                setNotifications(list.filter((n) => !n.isRead))
            }
        } catch (e) {
            console.error('알림 목록 로드 실패:', e)
        }
    }

    const markAsRead = async (id: number) => {
        try {
            const res = await api.post<RsData<null>>(`/notifications/${id}/read`)
            if (res.data.resultCode?.startsWith('200')) {
                // ✅ 읽음 처리되면 리스트에서 제거 (삭제처럼 보임)
                setNotifications((prev) => prev.filter((n) => n.id !== id))
                setUnreadCount((prev) => Math.max(0, prev - 1))
            }
        } catch (e) {
            console.error('알림 읽음 처리 실패:', e)
        }
    }

    // ✅ 알림 클릭: 문의면 마이페이지 QnA로, 아니면 link로
    const handleAlarmClick = async (n: NotificationItem) => {
        if (!n.isRead) {
            await markAsRead(n.id)
        } else {
            // 혹시나 read 상태로 들어오면(현재는 필터링이라 거의 없음)
            setNotifications((prev) => prev.filter((x) => x.id !== n.id))
        }

        setIsAlarmOpen(false)

        // ✅ 문의 답변 알림이면 QnA 탭으로 강제 이동
        if (n.message.includes('문의')) {
            router.push('/personal?tab=qna')
            return
        }

        if (n.link) {
            router.push(toAppPath(n.link))
        }
    }

    // ✅ 로그인 확인 후: 뱃지 먼저
    useEffect(() => {
        if (!isLoggedIn) {
            setUnreadCount(0)
            setNotifications([])
            return
        }
        fetchUnreadCount()
    }, [isLoggedIn])

    // 바깥 클릭/ESC로 알림 닫기
    useEffect(() => {
        if (!isAlarmOpen) return

        const onMouseDown = (e: MouseEvent) => {
            if (!alarmRef.current) return
            if (!alarmRef.current.contains(e.target as Node)) setIsAlarmOpen(false)
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsAlarmOpen(false)
        }

        document.addEventListener('mousedown', onMouseDown)
        document.addEventListener('keydown', onKeyDown)

        return () => {
            document.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [isAlarmOpen])

    // ================== 로그아웃 ==================
    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8090/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',
            })
        } catch (e) {
            console.error('로그아웃 실패:', e)
        } finally {
            window.location.href = '/'
        }
    }

    return (
        <nav className={styles.nav}>
            <section className={styles.Fsection}>
                <div className={styles.FirstC}>
                    <div>
                        <Link href="/" className={styles.Logo}>
                            <Image src={로고} alt="로고" className={styles.LogoIcon} />
                        </Link>
                    </div>

                    <div className={`${styles.buttonGroup} ${isHamburgerOpen ? styles.buttonGroupOpen : ''}`}>
                        {/* ================== 알림 버튼 (데스크탑/태블릿용) ================== */}
                        {isLoggedIn && (
                            <div className={styles.alarmWrapper} ref={alarmRef}>
                                <button
                                    type="button"
                                    className={styles.alarmButton}
                                    aria-label="알림"
                                    aria-expanded={isAlarmOpen}
                                    onClick={async () => {
                                        const next = !isAlarmOpen
                                        setIsAlarmOpen(next)
                                        if (next) {
                                            await fetchNotifications()
                                            await fetchUnreadCount()
                                        }
                                    }}
                                >
                                    <Image src={bellIcon} alt="알림종" width={25} height={25} />
                                    {/* 숫자 대신 N */}
                                    {unreadCount > 0 && <span className={styles.alarmBadge}>N</span>}
                                </button>

                                {isAlarmOpen && (
                                    <div className={styles.alarmDropdown}>
                                        <div className={styles.alarmHeader}>
                                            <strong>알림</strong>
                                        </div>

                                        {notifications.length === 0 ? (
                                            <div className={styles.alarmEmpty}>새 알림이 없습니다.</div>
                                        ) : (
                                            <ul className={styles.alarmList}>
                                                {notifications.map((n) => (
                                                    <li key={n.id} className={styles.alarmItem}>
                                                        <button
                                                            type="button"
                                                            className={styles.alarmRowButton}
                                                            onClick={() => handleAlarmClick(n)}
                                                        >
                                                            <span className={styles.alarmMessage}>{n.message}</span>
                                                            {/* ✅ 날짜만 */}
                                                            <span className={styles.alarmTime}>
                                                                {formatDate(n.createdAt)}
                                                            </span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <AdminNavButton />

                        {isLoggedIn && (
                            <Link href="/personal" className={styles.navButton}>
                                마이페이지
                            </Link>
                        )}

                        {!isLoggedIn && !loading && (
                            <>
                                <Link href="/auth/login" className={styles.navButton}>
                                    로그인
                                </Link>
                                <Link href="/auth/signup" className={styles.navButton}>
                                    회원가입
                                </Link>
                            </>
                        )}

                        {isLoggedIn && (
                            <button type="button" className={styles.navButton} onClick={handleLogout}>
                                로그아웃
                            </button>
                        )}

                        <Link href="/support" className={styles.navButton}>
                            고객센터
                        </Link>

                        {!hideCategorySection && (
                            <div className={styles.mobileCategoryWrapper}>
                                {categories.map((cat) => {
                                    const isOpen = openMobileCategoryId === cat.id

                                    const handleCategoryClick = () => {
                                        setOpenMobileCategoryId((prev) => (prev === cat.id ? null : cat.id))
                                    }

                                    return (
                                        <div key={cat.id} className={styles.mobileCategoryBlock}>
                                            <div
                                                className={`${styles.mobileCategoryTitle} ${
                                                    isOpen ? styles.mobileCategoryTitleOpen : ''
                                                }`}
                                                onClick={handleCategoryClick}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        handleCategoryClick()
                                                    }
                                                }}
                                            >
                                                {cat.name}
                                                <span className={styles.mobileCategoryArrow}>⌵</span>
                                            </div>

                                            <ul
                                                className={`${styles.mobileSubcategoryList} ${
                                                    isOpen ? styles.mobileSubcategoryListOpen : ''
                                                }`}
                                            >
                                                {(subCategoriesByCat[cat.id] ?? []).map((sub) => (
                                                    <li key={sub.id}>
                                                        <Link
                                                            href={{
                                                                pathname: '/product/list',
                                                                query: {
                                                                    categoryId: String(cat.id),
                                                                    subId: String(sub.id),
                                                                },
                                                            }}
                                                            prefetch={false}
                                                            onClick={() => {
                                                                setIsHamburgerOpen(false)
                                                                setOpenMobileCategoryId(null)
                                                            }}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <button
                        className={`${styles.hamburger} ${isHamburgerOpen ? styles.hamburgerOpen : ''}`}
                        type="button"
                        onClick={() => setIsHamburgerOpen((prev) => !prev)}
                        aria-label="모바일 메뉴 버튼"
                        aria-expanded={isHamburgerOpen}
                    >
                        <span className={styles.hamburgerLine} />
                        <span className={styles.hamburgerLine} />
                        <span className={styles.hamburgerLine} />
                    </button>
                </div>
            </section>

            {!hideCategorySection && (
                <section className={styles.desktopCategorySection}>
                    <div className={styles.categoryContainer}>
                        <div className={styles.categoryBackContainer}>
                            <div className={styles.categorySubContainer}>
                                {categories.map((cat) => (
                                    <ul className={styles.categoryList2} key={cat.id}>
                                        <li>
                                            <strong className={styles.categoryTitle}>{cat.name}</strong>
                                            <ul className={styles.subcategoryList}>
                                                {(subCategoriesByCat[cat.id] ?? []).map((sub) => (
                                                    <li key={sub.id} className={styles.subCatTitle}>
                                                        <Link
                                                            href={{
                                                                pathname: '/product/list',
                                                                query: {
                                                                    categoryId: String(cat.id),
                                                                    subId: String(sub.id),
                                                                    subName: String(sub.name),
                                                                },
                                                            }}
                                                            prefetch={false}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    </ul>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </nav>
    )
}
