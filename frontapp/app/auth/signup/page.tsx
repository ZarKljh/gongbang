import Link from 'next/link'
import './signup.css'

export default function SignupSelector() {
    return (
        <div className="signup-container">
            <h3 className="signup-title">회원가입유형을 선택해주세요</h3>
            <div className="signup-group">
                <div className="signup-box signup-user-icon">
                    <Link href="/auth/signup/user">
                        <span>일반사용자</span>
                    </Link>
                </div>
                <div className="signup-box signup-seller-icon">
                    <Link href="/auth/signup/seller">
                        <span>공방사업자</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
