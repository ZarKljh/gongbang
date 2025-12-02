import styles from '@/app/admin/styles/MySection.module.css'
import Link from 'next/link'
import Image from 'next/image'
import 홈 from '@/public/images/house.png'
import 로고 from '@/public/images/Logo.png'
import 입점 from '@/public/images/market.png'
import 유저 from '@/public/images/management.png'
import 신고 from '@/public/images/report.png'
import 문의 from '@/public/images/interview.png'
import FAQ from '@/public/images/faq.png'

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
                    <Image src={홈} alt="홈" className={styles.navIcon} />
                    Home
                </Link>
                <Link className={styles.navItem} href="/">
                    <Image src={로고} alt="홈" className={styles.navIcon} />
                    Main
                </Link>
                <Link className={styles.navItem} href="/admin/business">
                    <Image src={입점} alt="홈" className={styles.navIcon} />
                    입점 신청
                </Link>
                <Link className={styles.navItem} href="/admin/users">
                    <Image src={유저} alt="홈" className={styles.navIcon} />
                    유저 관리
                </Link>
                <Link className={styles.navItem} href="/admin/admin_reports">
                    <Image src={신고} alt="홈" className={styles.navIcon} />
                    신고 관리
                </Link>
                <Link className={styles.navItem} href="/admin/inquiries">
                    <Image src={문의} alt="홈" className={styles.navIcon} />
                    문의 관리
                </Link>
                <Link className={styles.navItem} href="/admin/faq">
                    <Image src={FAQ} alt="홈" className={styles.navIcon} />F & Q 관리
                </Link>
            </nav>
        </aside>
    )
}
