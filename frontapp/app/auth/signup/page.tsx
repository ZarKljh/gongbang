import Link from 'next/link'
import '../common/auth-selector.css'
//import './signup.css'

export default function SignupSelector() {
    return (
        <div className="auth-container">
            <h3 className="auth-title">회원가입유형을 선택해주세요</h3>
            <div className="auth-group">
                <Link href="/auth/signup/user" className="auth-box auth-user-icon">
                    <span>일반사용자</span>
                </Link>
                <Link href="/auth/signup/seller" className="auth-box auth-seller-icon">
                    <span>공방사업자</span>
                </Link>
            </div>
        </div>
    )
}
