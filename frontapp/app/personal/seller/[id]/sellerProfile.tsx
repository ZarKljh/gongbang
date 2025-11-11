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
}

export default function SellerProfile({ seller }: SellerProfileProps) {
    return (
        <div className="tab-content">
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
