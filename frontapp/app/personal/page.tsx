'use client'

import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import '@/app/personal/page.css'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk"
import api from '@/app/utils/api'

// 커스텀 훅
import { useOrders } from '@/app/personal/hooks/useOrders'
import { useCart } from '@/app/personal/hooks/useCart'
import { useAddress } from '@/app/personal/hooks/useAddress'
import { usePayment } from '@/app/personal/hooks/usePayment'
import { useProfile } from '@/app/personal/hooks/useProfile'
import { useQna } from '@/app/personal/hooks/useQna'
import { useReviews } from '@/app/personal/hooks/useReviews'
import { useWishlist } from '@/app/personal/hooks/useWishlist'

const API_BASE_URL = `${api.defaults.baseURL}`
export const IMAGE_BASE_URL = API_BASE_URL?.replace('/api/v1', '')

interface Stats {
  totalQna: number
  totalReviews: number
  preparing: number
  shipping: number
  completed: number
}

type PendingOrderItem = {
  productId: number
  quantity: number
}

export default function MyPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // =============== 전역 UI 상태 ===============
    const [pageLoading, setPageLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('orders')
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    // 통계 (QnA 수, 리뷰 수, 배송 상태)
    const [stats, setStats] = useState<Stats>({
        totalQna: 0,
        totalReviews: 0,
        preparing: 0,
        shipping: 0,
        completed: 0,
    })

    // 삭제/확인 모달
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean
        title: string
        message: string
        warning: string
        onConfirm: () => void
        onCancel: () => void
    }>({
        open: false,
        title: '',
        message: '',
        warning: '',
        onConfirm: () => {},
        onCancel: () => {},
    })

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean
        message: string
        onConfirm: null | (() => void)
        onCancel: null | (() => void)
    }>({
        open: false,
        message: '',
        onConfirm: null,
        onCancel: null,
    })

    // 사용자 정보
    const [userData, setUserData] = useState<any>(null)

    // =============== 커스텀 훅 연결 ===============

    // 주문 / 주문관리
        const {
            // 리스트
            orders,
            infiniteOrders,
            infiniteOrdersLoading,
            infiniteOrdersHasMore,
            infiniteOrdersLastId,
            filteredOrders,

            // 상태
            selectedStatus,
            activeFilter,
            isStatusModal,
            openOrderId,

            // 사유 입력 모달
            isReasonModal,
            reasonModalTitle,
            reasonText,

            // setters
            setIsStatusModal,
            setActiveFilter,
            setIsReasonModal,
            setReasonModalTitle,
            setReasonModalOnSubmit,
            setReasonText,

            // 기능
            fetchOrders,
            fetchInfiniteOrders,
            resetInfiniteOrders,
            handleStatusClick,
            toggleOrderDetail,
            submitReason,
            filterOrdersByStatus,
            ORDER_STATUS_LABEL,
            visibleOrders,
        } = useOrders()

    // 장바구니
        const {
            cart,
            selectedItems,
            selectedProducts,
            setCart,
            setSelectedItems,
            handlePurchaseComplete,
            fetchCart,
            handleUpdateCart,
            handleDeleteCart,
            handleSelectItem,
            handleToggleSelectAll,
            handleClearSelection,
        } = useCart()

    // 배송지
        const {
            addresses,
            isAddressModal,
            editAddressModal,
            editAddressData,
            defaultAddress,
            newAddress,
            isAddressSelectModalOpen,
            selectedAddress,
            setIsAddressModal,
            setEditAddressModal,
            setEditAddressData,
            setDefaultAddress,
            setNewAddress,
            setIsAddressSelectModalOpen,
            setSelectedAddress,
            fetchAddresses,
            handleSaveAddress,
            handleUpdateAddress,
            handleDeleteAddress,
            sample6_execDaumPostcode,
            sample6_execDaumPostcodeForEdit,
        } = useAddress(userData?.id)

    // 결제수단
        const {
            paymentMethods,
            isPaymentModal,
            paymentType,
            bankName,
            accountNumber,
            accountHolder,
            cardCompany,
            cardNumber,
            cardExpire,
            defaultPayment,
            errors: paymentErrors,
            setIsPaymentModal,
            setPaymentType,
            setBankName,
            setAccountNumber,
            setAccountHolder,
            setCardCompany,
            setCardNumber,
            setCardExpire,
            setDefaultPayment,
            fetchPaymentMethods,
            handleSavePayment,
            handleSetDefault,
            handleDeletePayment,
            maskCard,
        } = usePayment()

    // 프로필 / 계정정보
        const {
            tempData,
            errors: profileErrors,
            editMode,
            isAuthenticated,
            passwordInput,
            newPassword,
            confirmPassword,
            showAuthBox,
            isProfileModalOpen,
            previewProfileImage,
            profileFile,
            setPasswordInput,
            setNewPassword,
            setConfirmPassword,
            setShowAuthBox,
            setIsProfileModalOpen,
            setTempData,
            handleVerifyPassword,
            handleEdit,
            handleSave,
            handleCancel,
            handleProfileClick,
            handleProfileFileChange,
            handleProfileUpload,
            handleProfileDelete,
            fetchProfileImage,
        } = useProfile(userData, setUserData)

    // QnA
        const {
            qna,
            openQnaId,
            fetchQna,
            handleDeleteQna,
            toggleQna,
        } = useQna()

    // 리뷰
        const {
            infiniteReviews,
            infiniteReviewLoading,
            infiniteReviewHasMore,
            infiniteReviewLastId,
            isEditReviewModal,
            editReviewContent,
            editReviewRating,
            setInfiniteReviews,
            setInfiniteReviewHasMore,
            setInfiniteReviewLastId,
            setEditReviewContent,
            setEditReviewRating,
            fetchInfiniteReviews,
            handleEditClick,
            handleCloseModal,
            handleSaveEdit,
            handleDeleteReview,
        } = useReviews()

    // 위시리스트 / 팔로우 / 추천
        const {
            infiniteWishList,
            infiniteWishLoading,
            infiniteWishHasMore,
            infiniteWishLastId,
            followList,
            activeSubTab,
            setActiveSubTab,
            fetchInfiniteWishList,
            resetInfiniteWishList,
            fetchFollowList,
            handleRemoveWish,
            handleUnfollow,
            recommendItems,
            recommendMessage,
            fetchRecommendList,
        } = useWishlist()

    // =============== 결제 관련 상태 (토스 위젯) ===============
    const [orderCode, setOrderCode] = useState<string | null>(null)
    const [total, setTotal] = useState<number>(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [paymentWidget, setPaymentWidget] = useState<any>(null)
    const [widgetLoaded, setWidgetLoaded] = useState(false)
    const [pendingOrderItems, setPendingOrderItems] = useState<PendingOrderItem[]>([])

    const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
    const customerKey = 'lMWxsh58-vF7S1kAyBIuG'

    // =============== 공통 유틸 ===============
    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName)
        setIsMobileSidebarOpen(false)
    }

    // =============== 사용자 정보 조회 ===============
    const fetchUser = async () => {
        try {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/me`, {
            withCredentials: true,
        })

        if (data.code === '401') {
            window.location.href = '/auth/login'
            return null
        }

        setUserData(data.data)
        return data.data
        } catch (error) {
        console.error('사용자 정보 조회 실패:', error)
        return null
        }
    }

    // =============== 초기 로딩 ===============
    useEffect(() => {
        const init = async () => {
        setPageLoading(true)
        try {
            const user = await fetchUser()
            if (!user || !user.id) return

            await Promise.all([
            fetchOrders(),
            fetchCart(user.id),
            fetchAddresses(user.id),
            fetchPaymentMethods(),
            fetchFollowList(user.id),
            fetchQna(user.id),
            fetchProfileImage(user.id),
            fetchInfiniteWishList(null),
            fetchInfiniteReviews(null),
            fetchRecommendList(),
            fetchStats(user.id),
            ])
        } catch (e) {
            console.error('초기 데이터 로딩 실패:', e)
        } finally {
            setPageLoading(false)
        }
        }

        init()
    }, [])

    // =============== tab query 동기화 ===============
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab) setActiveTab(tab)
    }, [searchParams])

    // =============== 카카오 우편번호 스크립트 로드 ===============
    useEffect(() => {
        if (isAddressModal && !window.daum) {
        const script = document.createElement('script')
        script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
        script.async = true
        document.body.appendChild(script)
        }
    }, [isAddressModal])

    // =============== 통계 계산 ===============
    const fetchStats = async (userId: number) => {
        const res = await axios.get(`${API_BASE_URL}/mypage/stats`, {
            params: { userId },
            withCredentials: true,
        })
        setStats(res.data.data)
    }

    // =============== 삭제 모달 핸들러 ===============
    const handleReviewDeleteClick = (review: any) => {
        setDeleteModal({
            open: true,
            title: '리뷰 삭제',
            message: '정말로 이 리뷰를 삭제하시겠습니까?',
            warning: '삭제된 리뷰는 복구할 수 없습니다.',
            onConfirm: () => {
                handleDeleteReview(review.reviewId)
                setDeleteModal(prev => ({ ...prev, open: false }))
            },
            onCancel: () => setDeleteModal(prev => ({ ...prev, open: false })),
        })
    }

    const askDeleteCart = (cartId: number) => {
        setDeleteModal({
        open: true,
        title: '장바구니 삭제',
        message: '이 상품을 장바구니에서 삭제하시겠습니까?',
        warning: '',
        onConfirm: () => {
            handleDeleteCart(cartId)
            setDeleteModal(prev => ({ ...prev, open: false }))
        },
        onCancel: () => setDeleteModal(prev => ({ ...prev, open: false })),
        })
    }

    // =============== 기본 설정 모달 (배송지/결제수단) ===============
    const handleAskDefaultAddress = () => {
        if (!newAddress.recipientName || !newAddress.baseAddress || !newAddress.detailAddress) {
        alert('이름과 주소를 모두 입력해주세요.')
        return
        }

        setConfirmModal({
        open: true,
        message: '이 배송지를 기본 배송지로 설정하시겠습니까?',
        onConfirm: () => handleSaveAddress(true),
        onCancel: () => handleSaveAddress(false),
        })
    }

    const handleAskDefaultPayment = () => {
        setConfirmModal({
        open: true,
        message: '이 결제수단을 기본 결제수단으로 설정하시겠습니까?',
        onConfirm: () => handleSavePayment(true),
        onCancel: () => handleSavePayment(false),
        })
    }

    // =============== 무한 스크롤 ===============
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const viewportHeight = window.innerHeight
            const fullHeight = document.documentElement.scrollHeight

            if (scrollTop + viewportHeight >= fullHeight - 50) {
                if (activeTab === 'orders' && !infiniteOrdersLoading && infiniteOrdersHasMore) {
                    fetchInfiniteOrders(infiniteOrdersLastId)
                } else if (
                    activeTab === 'like' &&
                    activeSubTab === 'product' &&
                    !infiniteWishLoading &&
                    infiniteWishHasMore
                ) {
                    fetchInfiniteWishList(infiniteWishLastId)
                } else if (activeTab === 'reviews' && !infiniteReviewLoading && infiniteReviewHasMore) {
                    fetchInfiniteReviews(infiniteReviewLastId)
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        window.addEventListener('touchmove', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('touchmove', handleScroll)
        }
    }, [
        activeTab,
        activeSubTab,
        infiniteOrdersLoading,
        infiniteOrdersHasMore,
        infiniteOrdersLastId,
        infiniteWishLoading,
        infiniteWishHasMore,
        infiniteWishLastId,
        infiniteReviewLoading,
        infiniteReviewHasMore,
        infiniteReviewLastId,
        fetchInfiniteOrders,
        fetchInfiniteWishList,
        fetchInfiniteReviews,
    ])

    useEffect(() => {
        if (activeTab === 'orders' && infiniteOrders.length === 0) {
        resetInfiniteOrders()
        fetchInfiniteOrders(null)
        } else if (activeTab === 'like' && activeSubTab === 'product' && infiniteWishList.length === 0) {
        resetInfiniteWishList()
        fetchInfiniteWishList(null)
        } else if (activeTab === 'reviews' && infiniteReviews.length === 0) {
        setInfiniteReviews([])
        setInfiniteReviewHasMore(true)
        setInfiniteReviewLastId(null)
        fetchInfiniteReviews(null)
        }
    }, [activeTab, activeSubTab])

    // =============== 장바구니 → 배송지 선택 → 결제 흐름 ===============

    // 선택 상품 구매 버튼
    const handlePurchaseSelected = () => {
        if (selectedItems.length === 0) {
        alert('선택된 상품이 없습니다.')
        return
        }

        const selected = cart
        .filter(item => selectedItems.includes(item.cartId))
        .map(item => ({
            productId: item.productId,
            quantity: item.quantity,
        }))

        setPendingOrderItems(selected)
        setIsAddressSelectModalOpen(true)
    }

    // 배송지 선택 후 "다음" 버튼
    const handleAddressNext = async () => {
        if (!selectedAddress) {
        alert('배송지를 선택해주세요.')
        return
        }

        try {
        const res = await axios.post(
            `${API_BASE_URL}/payments/cart/prepare`,
            {
            items: pendingOrderItems,
            addressId: selectedAddress.userAddressId,
            },
            { withCredentials: true },
        )

        const { orderCode, totalPrice } = res.data.data

        setOrderCode(orderCode)
        setTotal(totalPrice)

        // 장바구니에서 구매한 cartId 기록 → 결제 성공 후 삭제용
        localStorage.setItem('ORDER_CART_IDS', JSON.stringify(selectedItems))
        localStorage.setItem('PAY_PENDING', '1')
        localStorage.setItem('orderCode', orderCode)

        setIsAddressSelectModalOpen(false)
        setIsModalOpen(true)
        } catch (error) {
        console.error('결제 준비 실패:', error)
        alert('결제 준비 중 오류가 발생했습니다.')
        }
    }

    // 토스 결제 위젯 초기화
    const handleInitPaymentWidget = async (amount: number) => {
        try {
        let widget = paymentWidget

        if (!widget) {
            widget = await loadPaymentWidget(clientKey, customerKey)
            setPaymentWidget(widget)
        }

        await widget.renderPaymentMethods('#payment-method', {
            value: amount,
        })

        await widget.renderAgreement('#agreement')

        setWidgetLoaded(true)
        } catch (e) {
        console.error('장바구니 위젯 초기화 실패', e)
        setWidgetLoaded(false)
        }
    }

    // 결제 모달 열릴 때 위젯 렌더
    useEffect(() => {
        if (!isModalOpen) return
        handleInitPaymentWidget(total)
    }, [isModalOpen, total])

    // 결제 요청
    const handleRequestPayment = async () => {
        if (!paymentWidget) {
        console.warn('[PAY] paymentWidget 없음')
        return
        }

        if (!orderCode) {
        console.warn('[PAY] orderCode 없음')
        return
        }

        try {
        await paymentWidget.requestPayment({
            amount: total,
            orderId: orderCode,
            orderName: '장바구니 상품 결제',
            successUrl: `${window.location.origin}/pay/success?orderId=${orderCode}&amount=${total}`,
            failUrl: `${window.location.origin}/pay/fail`,
        })
        } catch (e: any) {
        try {
            await axios.post(
            `${API_BASE_URL}/mypage/orders/cancel-before-payment`,
            { orderCode },
            { withCredentials: true },
            )
        } catch (cancelErr) {
            console.error('[PAY] cancel-before-payment API 호출 실패', cancelErr)
        }

        if (e?.code === 'USER_CANCEL') {
            alert('결제가 취소되었습니다.')
        } else {
            alert('결제 요청 중 오류가 발생했습니다.')
        }
        }
    }

    // 결제 성공 후 후처리 (장바구니 삭제 등)
    useEffect(() => {
        const payPending = localStorage.getItem('PAY_PENDING')
        if (!payPending) return

        const cameFromSuccess = document.referrer.includes('/pay/success')

        if (cameFromSuccess) {
        const stored = localStorage.getItem('ORDER_CART_IDS')
        if (stored) {
            const cartIds = JSON.parse(stored)

            axios
            .delete(`${API_BASE_URL}/mypage/cart/after-order`, {
                data: { cartIds },
                withCredentials: true,
            })
            .then(() => {
                localStorage.removeItem('ORDER_CART_IDS')
                if (userData?.id) {
                fetchCart(userData.id)
                }
            })
            .catch(e => console.error('장바구니 항목 삭제 실패:', e))
        }

        setIsModalOpen(false)
        setPaymentWidget(null)
        setTotal(0)
        setOrderCode(null)
        setSelectedItems([])
        localStorage.removeItem('PAY_PENDING')
        }
    }, [])

    const handleClosePaymentModal = () => {
        setIsModalOpen(false)
        setWidgetLoaded(false)
        setPaymentWidget(null)
        setOrderCode(null)
        setTotal(0)
        setSelectedItems([])
    }

    // 선택된 첫 번째 장바구니 아이템 (UI에 표시용)
    const firstSelectedCartId = selectedItems[0]
    const firstSelectedItem = cart.find(item => item.cartId === firstSelectedCartId)

    const sliderRef = useRef<HTMLDivElement>(null)

    const moveSlide = (dir: number) => {
        const slider = sliderRef.current
        if (!slider) return

        slider.scrollBy({
            left: dir * 300, // 카드 1개 정도 만큼 이동
            behavior: "smooth"
        })
    }

    // =============== 렌더링 조건 ===============
    if (pageLoading) {
        return <div>로딩중...</div>
    }

    if (!userData) {
        return (
            <div className='need-login'>
                로그인이 필요합니다.
                <button onClick={() => (window.location.href = '/auth/login')}>로그인하기</button>
            </div>
        )
    }

    // =============== 메인 렌더링 ===============
    return (
        <div className="mypage-container">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@40,400,0,0&icon_names=user_attributes" />
            {/* 햄버거 메뉴 버튼 */}
            <button 
                className={`mobile-menu-button ${isMobileSidebarOpen ? 'active' : ''}`}
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
                <span className="material-symbols-outlined user-attributes">
                    user_attributes
                </span>
            </button>

            {/* 사이드바 오버레이 */}
            <div 
                className={`sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`}
                onClick={() => setIsMobileSidebarOpen(false)}
            ></div>

            {/* 왼쪽 사이드바 */}
            <div className={`mypage-sidebar ${isMobileSidebarOpen ? 'active' : ''}`}>
                <h1>{userData.nickName}</h1>

                <nav>
                    <div className="nav-section">
                        <h2>나의 쇼핑정보</h2>
                        <ul>
                            <li>
                                <button
                                    className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('orders')}
                                >
                                    주문배송조회
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-btn ${activeTab === 'ordersManage' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('ordersManage')}
                                >
                                    주문 취소 / 반품 / 교환
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-btn ${activeTab === 'cart' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('cart')}
                                >
                                    장바구니
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('reviews')}
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
                                    onClick={() => handleTabClick('profile')}
                                >
                                    회원정보수정
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('addresses')}
                                >
                                    배송지 관리
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-btn ${activeTab === 'payment' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('payment')}
                                >
                                    결제수단
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-btn ${activeTab === 'like' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('like')}
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
                                    onClick={() => handleTabClick('qna')}
                                >
                                    문의 내역
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>
                {userData?.roleType === "SELLER" && (
                    <a href="/personal/seller" className='link-btn'>공방 페이지로 이동</a>
                )}
            </div>

            {/* 오른쪽 콘텐츠 */}
            <div className="main-content">
                <div className="content-wrapper">
                    {/* 프로필, 문의, 리뷰 정보 */}
                    <div className="stats-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>프로필</th>
                                    <th>문의</th>
                                    <th>상품 리뷰</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="profile-image" onClick={handleProfileClick}>
                                                <img
                                                    src={
                                                        previewProfileImage ||
                                                        stats.profileImageUrl || `${IMAGE_BASE_URL}${stats.profileImageUrl}` // 서버 이미지
                                                    }
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/images/default_profile.jpg"
                                                    }}
                                                    alt="프로필 이미지"
                                                />
                                        </div>
                                    </td>
                                    <td className='shortcut-btn' onClick={() => handleTabClick('qna')}>{stats.totalQna}</td>
                                    <td className='shortcut-btn' onClick={() => handleTabClick('reviews')}>{stats.totalReviews}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 주문배송조회 */}
                    {activeTab === 'orders' && (
                        <div className="tab-content">

                            {/* ================= 배송 상태 요약 ================= */}
                            <div className="delivery-status-summary">
                                {/* 배송준비중 - 전체 */}
                                <div
                                    className="status-card"
                                    onClick={() => {
                                        handleStatusClick('배송준비중')
                                        setIsStatusModal(true)
                                    }}
                                >
                                    <p>배송준비중</p>
                                    <p>{stats.preparing}</p>
                                </div>

                                {/* 배송중 - 전체 */}
                                <div
                                    className="status-card"
                                    onClick={() => {
                                        handleStatusClick('배송중')
                                        setIsStatusModal(true)
                                    }}
                                >
                                    <p>배송중</p>
                                    <p>{stats.shipping}</p>
                                </div>

                                {/* 배송완료 - 7일 이내만 */}
                                <div
                                    className="status-card"
                                    onClick={() => {
                                        handleStatusClick('배송완료')
                                        setIsStatusModal(true)
                                    }}
                                >
                                    <p>배송완료</p>
                                    <p>{stats.completed}</p>
                                </div>
                            </div>

                            {/* ================= 주문 내역 ================= */}
                            <div className="section-header">
                                <h2>주문 내역</h2>
                            </div>

                            {infiniteOrders.length === 0 ? (
                                <p className='empty-state'>주문 내역이 없습니다.</p>
                            ) : (
                                infiniteOrders.map((order) => (
                                    <div
                                        key={order.orderId}
                                        className="order-card"
                                    >
                                        {/* 주문 요약 */}
                                        <div
                                            className="order-header"
                                            onClick={() => router.push(`/personal/${order.orderId}`)}
                                        >
                                            <div className='order-title'>
                                                <p>주문 일자: {order.createdDate} | 주문번호: {order.orderCode}</p>
                                                <span className={`badge ${order.deliveryStatus}`}>{order.deliveryStatus}</span>
                                                <span className={`badge ${order.status}`}>{ORDER_STATUS_LABEL[order.status]}</span>
                                            </div>
                                            <div className='order-img'>
                                                {(order.items || []).slice(0, 4).map((item, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={`${IMAGE_BASE_URL}${item.imageUrl}`}
                                                        alt={item.productName}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="order-footer">
                                            <button
                                                type="button"
                                                className="order-btn shipping-btn btn-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation() // 상단 onClick 안 타게 방지
                                                    router.push(`/personal/delivery/${order.orderId}`)
                                                }}
                                            >
                                                배송 조회
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                            {infiniteOrdersLoading && <p style={{ textAlign: 'center' }}>Loading...</p>}
                            {!infiniteOrdersHasMore && <p style={{ textAlign: 'center', color: '#999' }}>-</p>}
                        </div>
                    )}

                    {/* 주문 취소 / 반품 / 교환 */}
                    {activeTab === 'ordersManage' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>취소 / 반품 / 교환 내역</h2>
                            </div>

                            <div className="filter-select-box">
                                <select
                                    value={activeFilter}
                                    onChange={(e) => setActiveFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="ALL">전체</option>
                                    <option value="CANCELLED">취소</option>
                                    <option value="RETURN">반품</option>
                                    <option value="EXCHANGE">교환</option>
                                </select>
                            </div>

                            <div className="orders-list">
                                {filteredOrders.length === 0 ? (
                                    <p className='empty-state'>해당 주문 내역이 없습니다.</p>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const items = order.orderItems || []

                                        // 최신 배송 상태
                                        const latestDelivery = order.deliveries
                                            ?.slice()
                                            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))[0]

                                        const status = latestDelivery?.deliveryStatus || order.deliveryStatus
                                        const statusDate = latestDelivery?.modifiedDate || latestDelivery?.createdDate || "N/A"

                                        return (
                                            <div key={order.orderId} className="order-card">

                                                {/* 주문 요약 */}
                                                <div
                                                    className="order-header"
                                                    onClick={() => router.push(`/personal/${order.orderId}`)}
                                                >
                                                    <div className='order-title'>
                                                        <p>주문번호: {order.orderCode}</p>
                                                        <p> | 주문일: {order.createdDate}</p>
                                                        <p> | {status} 일시: {statusDate}</p>
                                                    </div>
                                                    <span className={`badge ${order.status}`}>{ORDER_STATUS_LABEL[order.status]}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* 장바구니 */}
                    {activeTab === 'cart' && (
                        <div className='tab-content'>
                            <div className='section-header'>
                                <h2>장바구니</h2>
                            </div>

                            {cart.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🛒</div>
                                    <p>장바구니에 담은 상품이 없습니다.</p>
                                    <Link href="/product/list" className="empty-state-link">
                                        쇼핑 계속하기
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* 장바구니 헤더 */}
                                    <div className="cart-header">
                                        <div className="cart-header-left">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.length === cart.length && cart.length > 0}
                                                    onChange={handleToggleSelectAll}
                                                />
                                                전체 선택
                                            </label>
                                            {selectedItems.length > 0 && (
                                                <span className="selection-info">
                                                    <span className="selection-count">
                                                        {
                                                            cart
                                                                .filter(item => selectedItems.includes(item.cartId))
                                                                .reduce((sum, item) => sum + item.quantity, 0)
                                                        }
                                                    </span>개 상품 선택됨
                                                </span>
                                            )}
                                        </div>
                                        <div className="cart-header-right">
                                            <button className="cart-btn btn-primary" onClick={handleClearSelection}>
                                                선택 해제
                                            </button>
                                        </div>
                                    </div>

                                    {/* 장바구니 목록 */}
                                    <div className="cart-list">
                                        {cart.map((item) => (
                                            <div key={item.cartId} className="cart-product">
                                                <div className="cart-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item.cartId)}
                                                        onChange={(e) => handleSelectItem(item.cartId, e.target.checked)}
                                                    />
                                                </div>

                                                <div className="cart-image">
                                                    <img 
                                                        src={`${IMAGE_BASE_URL}${item.imageUrl}`}
                                                        alt={item.productName}
                                                    />
                                                </div>

                                                <div className='cart-info'>
                                                    <Link href={`/product/list/detail?productId=${item.productId}`} className="cart-product-name shortcut-btn">
                                                        {item.productName}
                                                    </Link>
                                                    <div className="product-unit-price">
                                                        단가: {item.price?.toLocaleString()}원
                                                    </div>
                                                    <div className="product-price">
                                                        {(item.price * item.quantity).toLocaleString()}원
                                                    </div>
                                                </div>

                                                <div className="quantity-control">
                                                    <button 
                                                        className="link-btn"
                                                        onClick={() => handleUpdateCart(item.cartId, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="quantity-display">{item.quantity}</span>
                                                    <button 
                                                        className="link-btn"
                                                        onClick={() => handleUpdateCart(item.cartId, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <div className="cart-delete">
                                                    <button
                                                        className="link-btn delete cart-btn"
                                                        onClick={() => askDeleteCart(item.cartId)}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 장바구니 푸터 */}
                                    <div className="cart-footer">
                                        <div className="cart-summary">
                                            <div className="summary-row">
                                            </div>
                                            <div className="summary-row">
                                                <span className="summary-label">배송비</span>
                                                <span className="summary-value">무료</span>
                                            </div>
                                            <div className="summary-row total">
                                                <span className="summary-label">총 결제금액</span>
                                                <span className="summary-value">
                                                    {selectedItems.length === 0
                                                        ? 0
                                                        : cart
                                                            .filter(item => selectedItems.includes(item.cartId))
                                                            .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                                                            .toLocaleString()}원
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className="cart-btn btn-primary"
                                            disabled={selectedItems.length === 0}
                                            onClick={handlePurchaseSelected}
                                        >
                                            선택 상품 구매하기
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* 회원정보수정 */}
                    {activeTab === 'profile' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>회원정보수정</h2>
                                {!editMode.profile ? (
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            setShowAuthBox(!showAuthBox) 
                                            handleEdit('profile')
                                        }}
                                    >
                                        수정
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-primary" onClick={() => handleSave('profile')}>
                                            저장
                                        </button>
                                        <button className="btn-primary" onClick={() => handleCancel('profile')}>
                                            취소
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 아코디언 전체 */}
                            <div className={showAuthBox && !isAuthenticated ? "auth-accordion open" : "auth-accordion"}>
                                {!isAuthenticated && (
                                    <div className="auth-banner">
                                        <span>정보 수정을 위해 비밀번호 인증이 필요합니다</span>

                                        <div className='auth-banner-input'>
                                            <input
                                                type="password"
                                                placeholder="현재 비밀번호 입력"
                                                value={passwordInput}
                                                onChange={(e) => setPasswordInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === "Enter") handleVerifyPassword() }}
                                            />
                                            <div className='auth-banner-btn' onClick={handleVerifyPassword}>
                                                인증 확인
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isAuthenticated && (
                                    <div className="auth-banner success">인증 완료</div>
                                )}
                            </div>

                            {/* 인증 완료 표시 */}
                            {isAuthenticated && <div className="auth-banner success">인증 완료</div>}

                            <div className='form-group-box'>
                                <div className="form-group">
                                    <label>이름</label>
                                    <p>{userData.fullName}</p>
                                </div>

                                <div className="form-group">
                                    <label>닉네임</label>
                                    {editMode.profile ? (
                                        <div className='profile-input'>
                                            <input
                                                type="text"
                                                value={tempData.nickName || ''}
                                                onChange={(e) => setTempData({ ...tempData, nickName: e.target.value })}
                                                className="editable"
                                            />
                                            {profileErrors.nickName && <p className="error-msg">{profileErrors.nickName}</p>}
                                        </div>
                                    ) : (
                                        <p>{userData.nickName}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    
                                    {editMode.profile && (
                                        <div className='profile-input'>
                                            <label>비밀번호</label>
                                            <input
                                                type="password"
                                                placeholder="새 비밀번호 입력"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="editable"
                                            />
                                            {profileErrors.newPassword && <p className="error-msg">{profileErrors.newPassword}</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    {editMode.profile && (
                                        <div className='profile-input'>
                                            <label>비밀번호 확인</label>
                                            <input
                                                type="password"
                                                placeholder="비밀번호 재입력"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            {profileErrors.confirmPassword && <p className="error-msg">{profileErrors.confirmPassword}</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>이메일</label>
                                    {editMode.profile ? (
                                        <div className='profile-input'>
                                            <input
                                                type="email"
                                                value={tempData.email || ''}
                                                onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                                                className="editable"
                                            />
                                            {profileErrors.email && <p className="error-msg">{profileErrors.email}</p>}
                                        </div>
                                    ) : (
                                        <p>{userData.email}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>휴대폰</label>
                                    {editMode.profile ? (
                                        <div className='profile-input'>
                                            <input
                                                type="tel"
                                                value={tempData.mobilePhone || ''}
                                                onChange={(e) => setTempData({ ...tempData, mobilePhone: e.target.value })}
                                                className="editable"
                                            />
                                            {profileErrors.mobilePhone && <p className="error-msg">{profileErrors.mobilePhone}</p>}
                                        </div>
                                    ) : (
                                        <p>{userData.mobilePhone}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>생년월일</label>
                                    <p>{userData.birth ? userData.birth.split('T')[0] : '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 배송지 관리 */}
                    {activeTab === 'addresses' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>배송지 관리</h2>
                                <button className="btn-primary" onClick={() => setIsAddressModal(true)}>
                                    + 새 배송지 추가
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="empty-state">등록된 배송지가 없습니다.</div>
                            ) : (
                                <div>
                                    {addresses.map((addr) => (
                                        <div key={addr.userAddressId} className="address-card">
                                            <div className="card-header">
                                                <div className="card-title">
                                                    <span>{addr.recipientName}</span>
                                                    {addr.isDefault && <span className="badge">기본배송지</span>}
                                                </div>
                                                <div className="card-actions">
                                                    <button
                                                        className="link-btn"
                                                        onClick={() => {
                                                            setEditAddressData(addr)
                                                            setEditAddressModal(true)
                                                        }}
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        className="link-btn delete"
                                                        onClick={() => handleDeleteAddress(addr.userAddressId)}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="card-content">
                                                <p>[{addr.zipcode}]</p>
                                                <p>{addr.baseAddress}</p>
                                                <p>{addr.detailAddress}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 결제수단 */}
                    {activeTab === 'payment' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>결제수단</h2>
                                <button className="btn-primary" onClick={() => setIsPaymentModal(true)}>
                                    + 결제수단 추가
                                </button>
                            </div>

                            {paymentMethods.length === 0 ? (
                                <div className="empty-state">등록된 결제수단이 없습니다.</div>
                            ) : (
                                <div className="payment-list">
                                {paymentMethods.map((pm) => (
                                    <div key={pm.paymentId} className="payment-card">
                                    <div className="payment-card-info">
                                        <div className="card-header">
                                            {pm.type === "CARD" ? "신용/체크카드" : "계좌이체"}
                                            {pm.defaultPayment && <span className="badge">기본</span>}
                                        </div>
                                        <div className="card-content">
                                            {pm.type === "CARD" ? (
                                            <>
                                                <p>{pm.cardCompany}</p>
                                                <p>카드번호 {maskCard(pm.cardNumber)}</p>
                                                <p>유효기간 {pm.cardExpire}</p>
                                            </>
                                            ) : (
                                            <>
                                                <p>{pm.bankName}</p>
                                                <p>계좌번호 {pm.accountNumber}</p>
                                                <p>예금주 {pm.accountHolder}</p>
                                            </>
                                            )}
                                        </div>

                                        <div className="card-actions">
                                            {!pm.defaultPayment && <button className='link-btn' onClick={() => handleSetDefault(pm.paymentId)}>기본설정</button>}
                                            <button className="link-btn delete" onClick={() => handleDeletePayment(pm.paymentId)}>삭제</button>
                                        </div>
                                    </div>
                                    </div>
                                ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 나의 좋아요 */}
                    {activeTab === 'like' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>나의 좋아요</h2>
                            </div>

                            <div className="tab-nav">
                                <button
                                    className={`subtab-btn ${activeSubTab === 'product' ? 'active' : ''}`}
                                    onClick={() => setActiveSubTab('product')}
                                >
                                    Product
                                </button>
                                <button
                                    className={`subtab-btn ${activeSubTab === 'follow' ? 'active' : ''}`}
                                    onClick={() => setActiveSubTab('follow')}
                                >
                                    Follow
                                </button>
                            </div>

                            {activeSubTab === 'product' && (
                                <div className="subtab-content">
                                    <div className="rs-wrapper">

                                        <button className="rs-btn left" onClick={() => moveSlide(-1)}>‹</button>
                                        <button className="rs-btn right" onClick={() => moveSlide(1)}>›</button>

                                        <div className="rs-header">
                                            <h3>AI 추천 상품</h3>
                                        </div>

                                        {recommendMessage && (
                                            <div className="rs-message">{recommendMessage}</div>
                                        )}

                                        <div className="rs-slider" ref={sliderRef}>
                                            {recommendItems.map((item) => (
                                                <div
                                                    key={item.productId}
                                                    className="rs-card"
                                                    onClick={() => {
                                                        router.push(`/product/list/detail?productId=${item.productId}`)
                                                    }}
                                                >
                                                    <img
                                                        src={item.imageUrl ? `${IMAGE_BASE_URL}${item.imageUrl}` : `${IMAGE_BASE_URL}/images/initImg/no-image-soft.png`}
                                                        className={`rs-thumb ${item.imageUrl ? "" : "placeholder"}`}
                                                        alt={item.productName}
                                                        draggable={false}
                                                    />

                                                    <div className="rs-name">{item.name}</div>
                                                    <div className="rs-price">
                                                        {item.price ? `${item.price.toLocaleString()}원` : "가격 없음"}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* 오른쪽 끝 공백 패딩 */}
                                            <div className="rs-slider-padding" />
                                        </div>
                                    </div>

                                    {infiniteWishList.length === 0 ? (
                                        <div className="empty-state">좋아요한 상품이 없습니다.</div>
                                    ) : (
                                        <div className="wishlist-grid">
                                            {infiniteWishList.map((item) => (
                                                <div
                                                    key={item.wishlistId}
                                                    className="wishlist-item"
                                                    onClick={() => router.push(`/product/list/detail?productId=${item.productId}`)}
                                                >
                                                    <div className="wishlist-image">
                                                        <img 
                                                            src={item.imageUrl
                                                                ? `${IMAGE_BASE_URL}${item.imageUrl}`
                                                                : "/no-image.png"}
                                                            alt={item.productName}
                                                        />
                                                    </div>
                                                    <div className="wishlist-info">
                                                        <p>{item.productName}</p>
                                                        <p className="price">{item.price ? `${item.price}원` : '가격 정보 없음'}</p>
                                                        <div className="wishlist-btn-box">
                                                            <button
                                                                className="link-btn delete"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleRemoveWish(item.wishlistId)
                                                                }}
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {infiniteWishLoading && <p style={{ textAlign: 'center' }}>Loading...</p>}
                                    {!infiniteWishHasMore && infiniteWishList.length > 0 && <p style={{ textAlign: 'center', color: '#999' }}>-</p>}
                                </div>
                            )}

                            {activeSubTab === 'follow' && (
                                <div className="subtab-content">
                                    {followList.length === 0 ? (
                                        <div className="empty-state">팔로우한 작가가 없습니다.</div>
                                    ) : (
                                        <ul className="follow-list">
                                            {followList.map((follow) => (
                                                <li key={follow.studioId} className="follow-card">
                                                    <div className="studio-info">
                                                        {follow.studioImageUrl ? (
                                                            <img 
                                                                src={`${IMAGE_BASE_URL}${follow.studioImageUrl}`}
                                                                alt={follow.studioName}
                                                                className="studio-image"
                                                            />
                                                        ) : (
                                                            <div className="studio-image-placeholder">🏪</div>
                                                        )}
                                                        <div className='studio-txt-box'>
                                                            <Link href={`/seller/studio/${follow.studioId}`}>
                                                                <h4 className='shortcut-btn'>{follow.studioName}</h4>
                                                            </Link>
                                                            <p>{follow.studioDescription}</p>
                                                        </div>
                                                    </div>
                                                    <div className='link-btn delete' onClick={() => handleUnfollow(follow.studioId)}>
                                                        언팔로우
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 상품리뷰 */}
                    {activeTab === 'reviews' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>상품 리뷰</h2>
                            </div>

                            {infiniteReviews.length === 0 ? (
                                <div className="empty-state">작성한 리뷰가 없습니다.</div>
                            ) : (
                                <div className="my-review-list">
                                    {infiniteReviews.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).map((review) => (
                                        <div key={review.reviewId} className="my-review-card">
                                            <div className="my-review-header">
                                                <Link href={`/product/list/detail?productId=${review.productId}`} className="my-review-product-name">
                                                    {review.productName}
                                                </Link>
                                                <span className="my-review-rating">⭐ {review.rating} / 5</span>
                                            </div>

                                            {review.images && review.images.length > 0 && (
                                                <div key={review.reviewId} className="my-review-images">
                                                    {review.images.map((url, i) => (
                                                        <img
                                                            key={i}
                                                            src={`${IMAGE_BASE_URL}${url}`}
                                                            alt={`리뷰 이미지 ${i + 1}`}
                                                            className="review-image-item"
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            <div className="my-review-content">{review.content}</div>

                                            <div className="my-review-footer">
                                                <span>작성일: {review.createdDate}</span>
                                                {review.modifiedDate && <span> · 수정일: {review.modifiedDate}</span>}
                                                <span className="my-review-like-count">👍 {review.reviewLike}</span>
                                                <button
                                                    onClick={() => handleEditClick(review)}
                                                    className="link-btn"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleReviewDeleteClick(review)}
                                                    className="link-btn delete"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {infiniteReviewLoading && <p style={{ textAlign: 'center' }}>Loading...</p>}
                            {!infiniteReviewHasMore && infiniteReviews.length > 0 && <p style={{ textAlign: 'center', color: '#999' }}>-</p>}
                        </div>
                    )}

                    {/* 문의 내역 */}
                    {activeTab === 'qna' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>문의 내역</h2>
                            </div>

                            {qna.length === 0 ? (
                                <div className="empty-state">작성한 문의가 없습니다.</div>
                            ) : (
                                <div className="qna-list">
                                    {qna.map((item) => (
                                        <div key={item.qnaId} className="qna-card">
                                            <div
                                                className="qna-click-area"
                                                onClick={() => toggleQna(item.qnaId)}
                                            >
                                                <div className="qna-header">
                                                    <div className="qna-title">{item.title}</div>
                                                    <span className="qna-type">{item.type}</span>
                                                </div>

                                                <div className="qna-status">
                                                    {item.answered ? (
                                                        <span className="answered">답변 완료</span>
                                                    ) : (
                                                        <span className="waiting">답변 대기 중</span>
                                                    )}
                                                </div>

                                                <div className="qna-content">{item.content}</div>
                                            </div>

                                            <div className="qna-footer">
                                                <span>작성일: {' '}
                                                    {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    })}
                                                </span>
                                                <button
                                                    onClick={(e) => {handleDeleteQna(item.qnaId)}}
                                                    type="button"
                                                    className={`link-btn delete ${item.answered ? 'disabled' : ''}`}
                                                    disabled={item.answered}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                            {openQnaId === item.qnaId && (
                                                <div className="qna-accordion">
                                                    {/* 답변 상세 */}
                                                    <div className="qna-info">
                                                        <h3>답변</h3>
                                                        <p>{item.answerContent || '답변 대기 중'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/*  배송 상태별 주문 모달  */}
            {isStatusModal && (
                <div className="modal-overlay" onClick={() => setIsStatusModal(false)}>
                    <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedStatus}</h2>
                            <button className="modal-close" onClick={() => setIsStatusModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            {visibleOrders.length === 0 ? (
                                <p className="empty-state">주문 내역이 없습니다.</p>
                            ) : (
                                <div className="modal-orders-list">
                                    {visibleOrders.map((order) => (
                                        <div key={order.orderId} className="modal-order-card">
                                            <div className="modal-order-header">
                                                <span className="order-date">{order.createdDate}</span>
                                                <span className="order-code">주문번호: {order.orderCode}</span>
                                            </div>

                                            <div className="modal-order-info">
                                                <Link href={`/product/list/detail?productId=${p.productId}`}>
                                                    <span className="product-name">
                                                        {order.items?.[0]?.productName || '상품 없음'}
                                                    </span>
                                                </Link>
                                                <span className={`badge ${order.deliveryStatus}`}>
                                                    {order.deliveryStatus}
                                                </span>
                                            </div>

                                            <div className="modal-order-footer">
                                                <span className="order-price">
                                                    {order.totalPrice?.toLocaleString()}원
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/*  배송지 추가 모달  */}
            {isAddressModal && (
                <div className="modal-overlay" onClick={() => setIsAddressModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>새 배송지 추가</h2>
                            <button className="modal-close" onClick={() => setIsAddressModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-field">
                                <label>수령인 이름</label>
                                <input
                                    type="text"
                                    placeholder="수령인 이름을 입력하세요"
                                    value={newAddress.recipientName}
                                    onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                                />
                            </div>

                            <div className="form-field">
                                <label>우편번호</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="우편번호"
                                        value={newAddress.zipcode}
                                        readOnly
                                    />
                                    <button className="btn-primary" onClick={sample6_execDaumPostcode}>
                                        우편번호 찾기
                                    </button>
                                </div>
                            </div>

                            <div className="form-field">
                                <label>주소</label>
                                <input
                                    type="text"
                                    placeholder="주소"
                                    value={newAddress.baseAddress}
                                    readOnly
                                />
                            </div>

                            <div className="form-field">
                                <label>상세주소</label>
                                <input
                                    type="text"
                                    placeholder="상세주소를 입력하세요"
                                    value={newAddress.detailAddress}
                                    onChange={(e) => setNewAddress({ ...newAddress, detailAddress: e.target.value })}
                                />
                            </div>

                            <div className="form-field">
                                <label>참고항목</label>
                                <input
                                    type="text"
                                    placeholder="참고항목"
                                    value={newAddress.extraAddress}
                                    readOnly
                                />
                            </div>

                            <div className="form-field">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={defaultAddress}
                                        onChange={(e) => setDefaultAddress(e.target.checked)}
                                    />
                                    <span>기본 배송지로 설정</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary delete" onClick={() => setIsAddressModal(false)}>
                                취소
                            </button>
                            <button className="btn-primary" onClick={handleAskDefaultAddress}>
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  배송지 수정 모달  */}
            {editAddressModal && editAddressData && (
                <div className="modal-overlay" onClick={() => setEditAddressModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>배송지 수정</h2>
                            <button className="modal-close" onClick={() => setEditAddressModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-field">
                                <label>수령인 이름</label>
                                <input
                                    type="text"
                                    placeholder="수령인 이름"
                                    value={editAddressData.recipientName}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, recipientName: e.target.value })}
                                />
                            </div>

                            <div className="form-field">
                                <label>우편번호</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="우편번호"
                                        value={editAddressData.zipcode}
                                        readOnly
                                    />
                                    <button className="btn-primary" onClick={sample6_execDaumPostcodeForEdit}>
                                        우편번호 찾기
                                    </button>
                                </div>
                            </div>

                            <div className="form-field">
                                <label>주소</label>
                                <input
                                    type="text"
                                    placeholder="주소"
                                    value={editAddressData.baseAddress}
                                    readOnly
                                />
                            </div>

                            <div className="form-field">
                                <label>상세주소</label>
                                <input
                                    type="text"
                                    placeholder="상세주소"
                                    value={editAddressData.detailAddress}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, detailAddress: e.target.value })}
                                />
                            </div>

                            <div className="form-field">
                                <label>참고항목</label>
                                <input
                                    type="text"
                                    placeholder="참고항목"
                                    value={editAddressData.extraAddress}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, extraAddress: e.target.value })}
                                />
                            </div>

                            <div className="form-field">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={defaultAddress}
                                        onChange={(e) => setDefaultAddress(e.target.checked)}
                                    />
                                    <span>기본 배송지로 설정</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary delete" onClick={() => setEditAddressModal(false)}>
                                취소
                            </button>
                            <button className="btn-primary" onClick={handleUpdateAddress}>
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  결제수단 추가 모달  */}
            {isPaymentModal && (
                <div className="modal-overlay" onClick={() => setIsPaymentModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>결제수단 추가</h2>
                            <button className="modal-close" onClick={() => setIsPaymentModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-field">
                                <label>결제수단</label>
                                <select 
                                    value={paymentType} 
                                    onChange={(e) => setPaymentType(e.target.value as any)}
                                    className="select-input"
                                >
                                    <option value="BANK">은행 계좌</option>
                                    <option value="CARD">신용/체크카드</option>
                                </select>
                            </div>

                            {paymentType === "BANK" && (
                                <>
                                    <div className="form-field">
                                        <label>은행명</label>
                                        <input 
                                            type="text"
                                            placeholder="은행명을 입력하세요"
                                            value={bankName} 
                                            onChange={(e) => setBankName(e.target.value)} 
                                        />
                                        {paymentErrors.bankName && <p className="error-msg">{paymentErrors.bankName}</p>}
                                    </div>
                                    <div className="form-field">
                                        <label>계좌번호</label>
                                        <input 
                                            type="text"
                                            placeholder="계좌번호를 입력하세요"
                                            value={accountNumber} 
                                            onChange={(e) => setAccountNumber(e.target.value)} 
                                        />
                                        {paymentErrors.accountNumber && <p className="error-msg">{paymentErrors.accountNumber}</p>}
                                    </div>
                                    <div className="form-field">
                                        <label>예금주</label>
                                        <input 
                                            type="text"
                                            placeholder="예금주명을 입력하세요"
                                            value={accountHolder} 
                                            onChange={(e) => setAccountHolder(e.target.value)} 
                                        />
                                        
                                    </div>
                                </>
                            )}

                            {paymentType === "CARD" && (
                                <>
                                    <div className="form-field">
                                        <label>카드사</label>
                                        <input 
                                            type="text"
                                            placeholder="카드사를 입력하세요"
                                            value={cardCompany} 
                                            onChange={(e) => setCardCompany(e.target.value)} 
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>카드번호</label>
                                        <input 
                                            type="text"
                                            placeholder="카드번호를 입력하세요"
                                            value={cardNumber} 
                                            onChange={(e) => setCardNumber(e.target.value)} 
                                        />
                                        {paymentErrors.cardNumber && <p className="error-msg">{paymentErrors.cardNumber}</p>}
                                    </div>
                                    <div className="form-field">
                                        <label>유효기간</label>
                                        <input 
                                            type="text"
                                            placeholder="MM/YY"
                                            value={cardExpire} 
                                            onChange={(e) => setCardExpire(e.target.value)} 
                                        />
                                        {paymentErrors.cardExpire && <p className="error-msg">{paymentErrors.cardExpire}</p>}
                                    </div>
                                </>
                            )}

                            <div className="form-field">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={defaultPayment} 
                                        onChange={(e) => setDefaultPayment(e.target.checked)} 
                                    />
                                    <span>기본 결제수단으로 설정</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary delete" onClick={() => setIsPaymentModal(false)}>
                                취소
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => handleAskDefaultPayment()}
                            >
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  리뷰 수정 모달  */}
            {isEditReviewModal && (
                <div className="modal-overlay" onClick={() => setIsEditReviewModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>리뷰 수정</h2>
                            <button className="modal-close" onClick={() => setIsEditReviewModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-field">
                                <label>별점</label>
                                <select
                                    value={editReviewRating}
                                    onChange={(e) => setEditReviewRating(Number(e.target.value))}
                                    className="select-input"
                                >
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <option key={num} value={num}>
                                            {'⭐'.repeat(num)} ({num}점)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label>리뷰 내용</label>
                                <textarea
                                    value={editReviewContent}
                                    onChange={(e) => setEditReviewContent(e.target.value)}
                                    placeholder="리뷰 내용을 입력하세요"
                                    rows={6}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary delete" onClick={handleCloseModal}>
                                취소
                            </button>
                            <button className="btn-primary" onClick={handleSaveEdit}>
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  삭제 모달  */}
            {deleteModal.open && (
                <div className="modal-overlay" onClick={deleteModal.onCancel}>
                    <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="modal-header">
                            <h2>{deleteModal.title || "삭제"}</h2>
                            <button className="modal-close" onClick={deleteModal.onCancel}>✕</button>
                        </div>

                        <div className="modal-body">
                            <p>{deleteModal.message || "정말 삭제하시겠습니까?"}</p>
                            {deleteModal.warning && (
                                <p className="modal-warning">{deleteModal.warning}</p>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary" onClick={deleteModal.onCancel}>
                                취소
                            </button>
                            <button className="btn-primary delete" onClick={deleteModal.onConfirm}>
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  사유 입력 모달  */}
            {isReasonModal && (
                <div className="modal-overlay" onClick={() => setIsReasonModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{reasonModalTitle}</h2>
                            <button className="modal-close" onClick={() => setIsReasonModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-field">
                                <label>사유</label>
                                <textarea
                                    placeholder="사유를 입력해주세요"
                                    value={reasonText}
                                    onChange={(e) => setReasonText(e.target.value)}
                                    rows={5}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary" onClick={() => setIsReasonModal(false)}>
                                취소
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    if (!reasonText.trim()) {
                                        alert("사유를 입력해주세요.")
                                        return
                                    }
                                    reasonModalOnSubmit(reasonText)
                                    setIsReasonModal(false)
                                    setReasonText("")
                                }}
                            >
                                제출
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  프로필 이미지 수정 모달  */}
            {isProfileModalOpen && (
                <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
                    <div className="modal-container modal-profile" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>프로필 이미지 수정</h2>
                            <button className="modal-close" onClick={() => setIsProfileModalOpen(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="profile-preview">
                                {previewProfileImage ? (
                                    <img
                                        src={previewProfileImage}
                                        alt="프로필 미리보기"
                                        className="profile-preview-img"
                                    />
                                ) : (
                                    <div className="profile-preview-empty">
                                        <span>이미지 없음</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-field">
                                <label className="file-input-label">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleProfileFileChange}
                                        className="file-input"
                                    />
                                    <span className="file-input-button">
                                        📁 이미지 선택
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="btn-primary" onClick={() => setIsProfileModalOpen(false)}>
                                취소
                            </div>
                            <div className="btn-primary delete" onClick={handleProfileDelete}>
                                삭제
                            </div>
                            <div className="btn-primary" onClick={handleProfileUpload}>
                                업로드
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 배송지 선택 모달 */}
            {isAddressSelectModalOpen && (
                <div className="modalOverlay">
                    <div className="modalContainer addressSelectModal">

                        <div className="modalHeader">
                            <h2 className="modalTitle">배송지 선택</h2>
                            <button
                                className="modalCloseBtn"
                                onClick={() => setIsAddressSelectModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="addressList">
                            {addresses.map(addr => (
                                <div
                                    key={addr.userAddressId}
                                    className={`
                                        addressItem
                                        ${addr.isDefault ? "defaultAddress" : ""}
                                        ${selectedAddress?.userAddressId === addr.userAddressId ? "selectedAddress" : ""}
                                    `}
                                    onClick={() => {
                                        setSelectedAddress(addr)
                                    }}
                                >
                                    <div className="addrName">{addr.recipientName}</div>
                                    <div className="addrDetail">
                                        [{addr.zipcode}] {addr.baseAddress} {addr.detailAddress}
                                    </div>

                                    {addr.isDefault && <span className="defaultBadge">기본 배송지</span>}
                                </div>
                            ))}
                        </div>

                        <div className="modalFooter">
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setIsAddressSelectModalOpen(false)
                                    setActiveTab("addresses")  // 배송지 탭으로 이동
                                }}
                            >
                                + 배송지 추가하기
                            </button>
                            <button
                                className="btn-primary"
                                onClick={async () => {
                                    if (!selectedAddress) {
                                        alert("배송지를 먼저 선택해주세요.")
                                        return
                                    }
                                    await handleAddressNext()
                                }}
                            >
                                다음으로
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* 결제 모달 */}
            {isModalOpen && (
                <div className="modalOverlay">
                    <div className="modalContainer">
                        
                        {/* 헤더 */}
                        <div className="modalHeader">
                            <h2 className="modalTitle">결제하기</h2>

                            <button
                                type="button"
                                onClick={handleClosePaymentModal}
                                className="modalCloseBtn"
                            >
                                ✕
                            </button>
                        </div>

                        {/* === 한 섹션 카드 === */}
                        <div className="modalSection">

                            {/* 상품 요약 */}
                            <div className="modalProductSummary">

                                {/* 대표 이미지 */}
                                <div className="summaryThumb">
                                    <img
                                        src={
                                            firstSelectedItem?.imageUrl
                                                ? `${IMAGE_BASE_URL}${firstSelectedItem.imageUrl}`
                                                : "/default-product.png"
                                        }
                                        alt="장바구니 대표 이미지"
                                    />
                                </div>

                                {/* 텍스트 */}
                                <div className="summaryText">
                                    <div className="summaryTitle">
                                        장바구니 상품 {
                                            cart
                                                .filter(item => selectedItems.includes(item.cartId))
                                                .reduce((sum, item) => sum + item.quantity, 0)
                                        }개
                                    </div>

                                    <div className="summaryDesc">
                                        여러 상품을 함께 결제합니다.
                                    </div>

                                    <div className="summaryRow">
                                        <span className="summaryLabel">총 상품 수</span>
                                        {
                                            cart
                                                .filter(item => selectedItems.includes(item.cartId))
                                                .reduce((sum, item) => sum + item.quantity, 0)
                                        }개
                                    </div>

                                    <div className="summaryRow">
                                        <span className="summaryLabel">총 결제 금액</span>
                                        <span className="summaryTotal">
                                            {total.toLocaleString()}원
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 구분선 */}
                            <div className="sectionDivider" />

                            {/* 결제 위젯 */}
                            <div className="paymentBox">
                                <div id="payment-method" className="paymentMethods" />
                                <div id="agreement" className="paymentAgreement" />
                            </div>
                        </div>

                        {/* 하단 결제 버튼 */}
                        <div className="modalFooter">
                            <button
                                type="button"
                                onClick={handleRequestPayment}
                                className="paymentSubmitBtn"
                                disabled={!widgetLoaded}
                            >
                                {widgetLoaded ? "결제하기" : "결제 준비중…"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 기본설정 모달 */}
            {confirmModal.open && (
                <div className="modal-overlay" onClick={() => setConfirmModal({ open: false })}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>확인</h2>
                        </div>
                        <div className="modal-body">
                            <p>{confirmModal.message}</p>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-primary delete" 
                                onClick={() => {
                                    confirmModal.onCancel?.()
                                    setConfirmModal(prev => ({ ...prev, open: false }))
                                }}
                            >
                                아니요
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={() => {
                                    confirmModal.onConfirm?.()
                                    setConfirmModal({ open: false })
                                }}
                            >
                                예
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}