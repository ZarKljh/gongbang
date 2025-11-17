'use client'

import React from 'react'

interface SellerProfileProps {
    seller: {
        userName: string
        nickName: string
        fullName: string
        email: string
        gender?: string
        birth?: string
        mobilePhone?: string
    }
    isAuthenticated: boolean
}

export default function SellerProfile({ seller, isAuthenticated }: SellerProfileProps) {
    return (
        <div className="tab-content">
            {!isAuthenticated ? (
                <div className="auth-banner">
                    <span>정보 수정을 위해 비밀번호 인증이 필요합니다</span>
                    <div className="auth-banner-input">
                        <input
                            type="password"
                            placeholder="현재 비밀번호 입력"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                        />
                        <button onClick={handleVerifyPassword}>인증 확인</button>
                    </div>
                </div>
            ) : (
                <div className="auth-banner success">인증 완료</div>
            )}
            <h2>셀러 프로필</h2>
            <p>
                <strong>아이디:</strong> {seller.userName}
            </p>
            <p>
                <strong>닉네임:</strong> {seller.nickName}
            </p>
            <p>
                <strong>이름:</strong> {seller.fullName}
            </p>
            <p>
                <strong>이메일:</strong> {seller.email}
            </p>
            {seller.gender && (
                <p>
                    <strong>성별:</strong> {seller.gender}
                </p>
            )}
            {seller.birth && (
                <p>
                    <strong>생년월일:</strong> {seller.birth}
                </p>
            )}
            {seller.mobilePhone && (
                <p>
                    <strong>휴대폰:</strong> {seller.mobilePhone}
                </p>
            )}
        </div>
    )
}
