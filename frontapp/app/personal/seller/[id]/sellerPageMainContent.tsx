'use client'

import React from 'react'
import '@/app/personal/seller/[id]/sellerPage.css'
import SellerProfile from './sellerProfile'
import StudioInfo from './studioInfo'

export default function SellerPageMainContent({
    activeTab,
    seller,
    studio,
    productList,
    mainImage,
}: {
    activeTab: string
    seller: any
    studio: any
    productList: any[]
    mainImage: any
}) {
    return (
        <section className="seller-main-content">
            {/* 셀러 프로필 */}
            {activeTab === 'seller-profile' && <SellerProfile seller={seller} />}

            {/* 비밀번호 변경 */}
            {activeTab === 'seller-password' && (
                <div className="tab-content">
                    <h2>비밀번호 변경</h2>
                    <p>비밀번호 변경 폼이 들어갈 자리입니다.</p>
                </div>
            )}

            {/* 공방 정보 */}
            {activeTab === 'studio-info' && <StudioInfo studio={studio} />}

            {/* 공방별 상품 관리 */}
            {activeTab === 'studio-products' && (
                <div className="tab-content">
                    <h2>공방별 상품 관리</h2>
                    {productList.length === 0 ? (
                        <p>등록된 상품이 없습니다.</p>
                    ) : (
                        <ul>
                            {productList.map((product, idx) => (
                                <li key={idx}>
                                    {product.name} - {product.price}원
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* 공방별 이벤트 관리 */}
            {activeTab === 'studio-events' && (
                <div className="tab-content">
                    <h2>공방별 이벤트 관리</h2>
                    <p>이벤트 관리 화면이 들어갈 자리입니다.</p>
                </div>
            )}

            {/* 공방별 주력상품 관리 */}
            {activeTab === 'studio-main-products' && (
                <div className="tab-content">
                    <h2>공방별 주력상품 관리</h2>
                    <p>주력상품 관리 화면이 들어갈 자리입니다.</p>
                </div>
            )}
        </section>
    )
}
