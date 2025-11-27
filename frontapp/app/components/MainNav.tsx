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
    }, [pathname])

    const isLoggedIn = !!user

    // ================== 카테고리 / 세부 카테고리 로드 ==================
    const fetchCategoriesAndSubs = async () => {
        try {
            // 1) 상위 카테고리 목록
            const res = await api.get('/category')
            const categoryList: Category[] = res.data.data.categoryList
            setCategories(categoryList)

            // 2) 각 카테고리별 서브카테고리 병렬 요청
            const subPromises = categoryList.map(async (cat) => {
                const res = await api.get(`/category/${cat.id}/sub`)
                const subs: SubCategory[] = res.data.data.subCategoryList
                return [cat.id, subs] as const
            })

            const results = await Promise.all(subPromises)

            // 3) categoryId → subCategory[] 맵 구조로 변환
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

                    <div>
                        <AdminNavButton />
                        {/* 로그인한 경우에만 마이페이지 */}
                        {isLoggedIn && (
                            <>
                                <Link href="/personal" className={styles.navButton}>
                                    마이페이지
                                </Link>
                            </>
                        )}

                        {/* 로그인 안 한 경우에만 로그인 / 회원가입 */}
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

                        {/* 로그인한 경우 로그아웃 */}
                        {isLoggedIn && (
                            <button type="button" className={styles.navButton} onClick={handleLogout}>
                                로그아웃
                            </button>
                        )}

                        {/* 고객센터는 항상 노출 */}
                        <Link href="/support" className={styles.navButton}>
                            고객센터
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================== 카테고리 / 세부 카테고리 영역 ================== */}
            <section>
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
        </nav>
    )
}
