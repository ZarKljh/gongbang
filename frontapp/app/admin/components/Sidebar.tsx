'use client'

import styles from '@/app/admin/styles/MySection.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import 홈 from '@/public/images/house.png'
import 로고 from '@/public/images/Logo.png'
import 입점 from '@/public/images/market.png'
import 유저 from '@/public/images/management.png'
import 신고 from '@/public/images/report.png'
import 문의 from '@/public/images/interview.png'
import FAQ from '@/public/images/faq.png'

export default function Sidebar() {
    const pathname = usePathname()

    // 현재 페이지와 href가 일치하면 true
    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname === href || pathname.startsWith(href + '/')
    }

    return (
        <aside className={styles.sidebar}>
            <div className={styles.profileBox}>
                <div className={styles.avatar}>AD</div>
                <div>
                    <div className={styles.profileName}>관리자</div>
                    <div className={styles.profileRole}>슈퍼 어드민</div>
                </div>
            </div>

            <nav className={styles.navMenu}>
                <Link
                    className={`${styles.navItem} ${isActive('/admin/admin_account') ? styles.navItemActive : ''}`}
                    href="/admin/admin_account"
                    aria-current={isActive('/admin/admin_account') ? 'page' : undefined}
                >
                    <Image src={홈} alt="홈" className={styles.navIcon} />
                    Home
                </Link>

                <Link
                    className={`${styles.navItem} ${isActive('/') ? styles.navItemActive : ''}`}
                    href="/"
                    aria-current={isActive('/') ? 'page' : undefined}
                >
                    <Image src={로고} alt="메인" className={styles.navIcon} />
                    Main
                </Link>

                <Link
                    className={`${styles.navItem} ${isActive('/admin/business') ? styles.navItemActive : ''}`}
                    href="/admin/business"
                    aria-current={isActive('/admin/business') ? 'page' : undefined}
                >
                    <Image src={입점} alt="입점 신청" className={styles.navIcon} />
                    입점 신청
                </Link>

                <Link
                    className={`${styles.navItem} ${isActive('/admin/users') ? styles.navItemActive : ''}`}
                    href="/admin/users"
                    aria-current={isActive('/admin/users') ? 'page' : undefined}
                >
                    <Image src={유저} alt="유저 관리" className={styles.navIcon} />
                    유저 관리
                </Link>

                <Link
                    className={`${styles.navItem} ${isActive('/admin/admin_reports') ? styles.navItemActive : ''}`}
                    href="/admin/admin_reports"
                    aria-current={isActive('/admin/admin_reports') ? 'page' : undefined}
                >
                    <Image src={신고} alt="신고 관리" className={styles.navIcon} />
                    신고 관리
                </Link>

                <Link
                    className={`${styles.navItem} ${isActive('/admin/inquiries') ? styles.navItemActive : ''}`}
                    href="/admin/inquiries"
                    aria-current={isActive('/admin/inquiries') ? 'page' : undefined}
                >
                    <Image src={문의} alt="문의 관리" className={styles.navIcon} />
                    문의 관리
                </Link>

                <Link
                    className={`${styles.navItem} ${isActive('/admin/faq') ? styles.navItemActive : ''}`}
                    href="/admin/faq"
                    aria-current={isActive('/admin/faq') ? 'page' : undefined}
                >
                    <Image src={FAQ} alt="FAQ 관리" className={styles.navIcon} />F &amp; Q 관리
                </Link>
            </nav>
        </aside>
    )
}
