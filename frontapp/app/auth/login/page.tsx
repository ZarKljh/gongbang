import Link from 'next/link'
import '../common/auth-selector.css'
//import './login.css'

export default function LoginSelector() {
    return (
        <div className="auth-container">
            <h3 className="auth-title">로그인유형을 선택해주세요</h3>
            <div className="auth-group">
                <Link href="/auth/login/user" className="auth-box auth-user-icon">
                    <span>일반사용자</span>
                </Link>
                <Link href="/auth/login/seller" className="auth-box auth-seller-icon">
                    <span>공방사업자</span>
                </Link>
            </div>
        </div>
    )
}
