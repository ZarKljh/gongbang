'use client'

import React from 'react'

interface StudioInfoProps {
    studio: {
        studioId?: string
        studioName?: string
        studioDescription?: string
        studioMobile?: string
        studioOfficeTell?: string
        studioFax?: string
        studioEmail?: string
        studioBusinessNumber?: string
        studioAddPostNumber?: string
        studioAddMain?: string
        studioAddDetail?: string
    }
}

export default function StudioInfo({ studio }: StudioInfoProps) {
    if (!studio || !studio.studioId) {
        return (
            <div className="tab-content">
                <h2>공방 정보</h2>
                <p>선택된 공방이 없습니다.</p>
            </div>
        )
    }

    return (
        <div className="tab-content">
            <h2>공방 정보</h2>
            <p>
                <strong>공방명:</strong> {studio.studioName}
            </p>
            <p>
                <strong>설명:</strong> {studio.studioDescription}
            </p>
            <p>
                <strong>전화번호:</strong> {studio.studioMobile}
            </p>
            <p>
                <strong>사무실 전화:</strong> {studio.studioOfficeTell}
            </p>
            <p>
                <strong>팩스:</strong> {studio.studioFax}
            </p>
            <p>
                <strong>이메일:</strong> {studio.studioEmail}
            </p>
            <p>
                <strong>사업자번호:</strong> {studio.studioBusinessNumber}
            </p>
            <p>
                <strong>주소:</strong> {studio.studioAddPostNumber} {studio.studioAddMain} {studio.studioAddDetail}
            </p>
        </div>
    )
}
