import { useState } from 'react'

interface SidebarProps {
    userData: any
    activeTab: string
    onTabClick: (tab: string) => void
}

export default function SellerSidebar({ seller, studio, studioList, activeTab, selectedStudioId, handleTabClick }) {
    return (
        <div className="seller-sidebar">
            <h1>{seller.nickName}님</h1>

            <nav>
                {/* 셀러정보관리 */}
                <div className="nav-section">
                    <h2>셀러정보관리</h2>
                    <ul>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'seller-profile' ? 'active' : ''}`}
                                onClick={() => handleTabClick('seller-profile')}
                            >
                                셀러 프로필 수정
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'seller-password' ? 'active' : ''}`}
                                onClick={() => handleTabClick('seller-password')}
                            >
                                비밀번호 변경
                            </button>
                        </li>
                    </ul>
                </div>

                {/* 공방관리 */}
                <div className="nav-section">
                    <h2>공방관리</h2>
                    <ul>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'studio-info' ? 'active' : ''}`}
                                onClick={() => handleTabClick('studio-info')}
                            >
                                공방정보관리
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'studio-products' ? 'active' : ''}`}
                                onClick={() => handleTabClick('studio-products')}
                            >
                                공방별 상품관리
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'studio-events' ? 'active' : ''}`}
                                onClick={() => handleTabClick('studio-events')}
                            >
                                공방별 이벤트관리
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'studio-main-products' ? 'active' : ''}`}
                                onClick={() => handleTabClick('studio-main-products')}
                            >
                                공방별 주력상품 관리
                            </button>
                        </li>
                    </ul>
                </div>

                {/* 공방 선택 */}
                <div className="nav-section">
                    <h2>내 공방 리스트</h2>
                    <ul>
                        {studioList.map((studio) => (
                            <li key={studio.studioId}>
                                <button
                                    className={`nav-btn ${selectedStudioId === studio.studioId ? 'active' : ''}`}
                                    onClick={() => handleStudioSelect(studio.studioId)}
                                >
                                    🏠 {studio.studioName}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </div>
    )
}
