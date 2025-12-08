'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

import styles from '@/app/layout.module.css'
import AdminNavButton from '@/app/admin/components/AdminNavButton'
import 로고 from '@/public/images/Logo.png'
import api from '@/app/utils/api'

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

export default function MainNav() {
    const [user, setUser] = useState<MeUser | null>(null)
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()

    const [categories, setCategories] = useState<Category[]>([])
    const [subCategoriesByCat, setSubCategoriesByCat] = useState<Record<number, SubCategory[]>>({})
    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
    const [openMobileCategoryId, setOpenMobileCategoryId] = useState<number | null>(null)

    const hideCategorySection = pathname === '/product/list'

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

            const data = await res.json()
            setUser(data?.data ?? null)
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
            {/* 상단 로고 + 우측 버튼 영역 */}
            <section className={styles.Fsection}>
                <div className={styles.FirstC}>
                    <div>
                        <Link href="/" className={styles.Logo}>
                            <Image src={로고} alt="로고" className={styles.LogoIcon} />
                        </Link>
                    </div>

                    <div className={`${styles.buttonGroup} ${isHamburgerOpen ? styles.buttonGroupOpen : ''}`}>
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

            {/* ================== 카테고리 / 세부 카테고리 영역 ================== */}
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
