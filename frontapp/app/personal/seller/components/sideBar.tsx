import Link from 'next/link'

interface SidebarProps {
    userData: any
    activeTab: string
    onTabClick: (tab: string) => void
    studioList: any[]
    studio: any
}

export default function Sidebar({ userData, activeTab, onTabClick, studioList, studio }: SidebarProps) {
    return (
        <div className="mypage-sidebar">
            <h1>{userData.nickName}</h1>

            <nav>
                <div className="nav-section">
                    <h2>나의 공방정보</h2>
                    <ul>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'studio' ? 'active' : ''}`}
                                onClick={() => onTabClick('studio')}
                            >
                                공방정보
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'studioDesc' ? 'active' : ''}`}
                                onClick={() => onTabClick('studioDesc')}
                            >
                                공방 상세설명
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'studioAdd' ? 'active' : ''}`}
                                onClick={() => onTabClick('studioAdd')}
                            >
                                공방 상세설명
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="nav-section">
                    <h2>나의 쇼핑정보</h2>
                    <ul>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => onTabClick('orders')}
                            >
                                주문배송조회
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'cart' ? 'active' : ''}`}
                                onClick={() => onTabClick('cart')}
                            >
                                장바구니
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => onTabClick('reviews')}
                            >
                                상품 리뷰
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="nav-section">
                    <h2>나의 계정정보</h2>
                    <ul>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => onTabClick('profile')}
                            >
                                회원정보수정
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                                onClick={() => onTabClick('addresses')}
                            >
                                배송지 관리
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'payment' ? 'active' : ''}`}
                                onClick={() => onTabClick('payment')}
                            >
                                결제수단
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'like' ? 'active' : ''}`}
                                onClick={() => onTabClick('like')}
                            >
                                나의 좋아요
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="nav-section">
                    <h2>고객센터</h2>
                    <ul>
                        <li>
                            <button
                                className={`nav-btn ${activeTab === 'qna' ? 'active' : ''}`}
                                onClick={() => onTabClick('qna')}
                            >
                                문의 내역
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            <Link href="/personal" className="link-btn">
                마이페이지로 이동
            </Link>
        </div>
    )
}
