import styles from '@/app/admin/styles/MySection.module.css'
import Link from 'next/link'

export default function Sidebar() {
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
                <Link className={styles.navItem} href="/admin/admin_account">
                    🏠 Home
                </Link>
                <Link className={styles.navItem} href="/">
                    🏠 Main
                </Link>
                <Link className={styles.navItem} href="/admin/business">
                    🏪 입점 신청
                </Link>
                <Link className={styles.navItem} href="/admin/users">
                    📁 유저 관리
                </Link>
                <Link className={styles.navItem} href="/admin/admin_reports">
                    ⚠️ 신고 관리
                </Link>
                <Link className={styles.navItem} href="/admin/inquiries">
                    💬 문의 관리
                </Link>
                <Link className={styles.navItem} href="/admin/faq">
                    F & Q 관리
                </Link>
            </nav>
        </aside>
    )
}
