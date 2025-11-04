'use client'

import axios from 'axios'
import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import '@/app/personal/page.css'

export default function MyPage() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordInput, setPasswordInput] = useState('')
    const [activeTab, setActiveTab] = useState('orders')
    const [activeSubTab, setActiveSubTab] = useState('product')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [editMode, setEditMode] = useState({})
    const [loading, setLoading] = useState(true)

    const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

    const [userData, setUserData] = useState<any>(null)
    const [tempData, setTempData] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [wishList, setWishList] = useState<any[]>([])
    const [followList, setFollowList] = useState<any[]>([])
    const [stats, setStats] = useState<any>({
        totalPoints: 0,
        totalReviews: 0,
        membershipLevel: 'Newbie',
    })

    // ------------------- 주문, 배송 -------------------
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isStatusModal, setIsStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderModal, setIsOrderModal] = useState(false);
    
    // ------------------- 배송지 -------------------
    const [addresses, setAddresses] = useState<any[]>([])
    const [isAddressModal, setIsAddressModal] = useState(false)
    const [newAddress, setNewAddress] = useState({
        recipientName: '',
        zipcode: '',
        baseAddress: '',
        detailAddress: '',
        extraAddress: '',
        isDefault: false,
    })
    const [editAddressModal, setEditAddressModal] = useState(false)
    const [editAddressData, setEditAddressData] = useState<any>(null)
    
    // ------------------- 결제수단 -------------------
    const [paymentMethods, setPaymentMethods] = useState([])
    const [isPaymentModal, setIsPaymentModal] = useState(false)
    const [paymentType, setPaymentType] = useState('BANK')
    const [bankName, setBankName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [cardCompany, setCardCompany] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [defaultPayment, setDefaultPayment] = useState(false)

    // ------------------- 주문 -------------------
    const [isOrdersModal, setIsOrdersModal] = useState(false)
    
    // ------------------- 리뷰 -------------------
    const [myReviews, setMyReviews] = useState([])

    // ------------------- 유저 정보 가져오기 -------------------
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            try {
                const { data } = await axios.get(`${API_BASE_URL}/me`, { withCredentials: true })

                if (data.code === '401') {
                    window.location.href = '/auth/login'
                    return
                }

                setUserData(data?.data || null)
            } catch (error: any) {
                console.error('사용자 정보 조회 실패:', error)
                alert('사용자 정보를 불러오는 중 문제가 발생했습니다. 다시 로그인 해주세요.')
                setUserData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    useEffect(() => {
        if (!userData?.id) return

        const loadAllData = async () => {
            setLoading(true)
            try {
                await Promise.all([
                    fetchOrders(userData.id),
                    fetchAddresses(userData.id),
                    fetchPaymentMethods(userData.id),
                    fetchWishList(userData.id),
                    fetchFollowList(userData.id),
                    fetchStatsData(userData.id),
                ])
            } catch (error) {
                console.error('데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadAllData()
    }, [userData])

    //모달이 열릴 때 스크립트를 로드 -->주소
    useEffect(() => {
        if (isAddressModal && !window.daum) {
            const script = document.createElement('script')
            script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
            script.async = true
            document.body.appendChild(script)
        }
    }, [isAddressModal])

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchMyReviews()
        }
    }, [activeTab])

    useEffect(() => {
        fetchOrders();
    }, []);

    // ------------------- API 요청 함수 -------------------
    const fetchOrders = async (id: number) => {
        if (!id) return
        try {
            const { data } = await axios.get(`${API_BASE_URL}/orders?userId=${id}`, { withCredentials: true })
            setOrders(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('주문 내역 조회 실패:', error)
            setOrders([])
        }
    }

    const flattenAddresses = (data: any[]): any[] => {
        return data.map((addr) => ({
            userAddressId: addr.userAddressId,
            userId: addr.siteUser?.userId,
            userName: addr.siteUser?.userName,
            recipientName: addr.recipientName,
            zipcode: addr.zipcode,
            baseAddress: addr.baseAddress,
            detailAddress: addr.detailAddress,
            extraAddress: addr.extraAddress,
            isDefault: addr.isDefault,
        }))
    }

    const fetchAddresses = async (id: number) => {
        if (!id) return
        try {
            const response = await axios.get(`${API_BASE_URL}/addresses?userId=${id}`, { withCredentials: true })
            const addressesData = response.data?.data || []
            const cleaned = flattenAddresses(addressesData)
            console.log('flattened addresses:', cleaned) // 확인용
            setAddresses(cleaned)
        } catch (error) {
            console.error('배송지 조회 실패:', error)
            setAddresses([])
        }
    }

    const fetchPaymentMethods = async () => {
        if (!userData?.id) return

        try {
            const { data } = await axios.get(`${API_BASE_URL}/payment-methods`, {
                withCredentials: true,
            })

            if (data.resultCode === '200') {
                setPaymentMethods(data.data)
            } else {
                alert(`결제수단 조회 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error(error)
            alert('결제수단 조회 중 오류가 발생했습니다.')
        }
    }

    const fetchWishList = async (id: number) => {
        if (!id) return
        try {
            const { data } = await axios.get(`${API_BASE_URL}/wishlist?userId=${id}`, { withCredentials: true })
            setWishList(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('위시 목록 조회 실패:', error)
            setWishList([])
        }
    }

    const fetchFollowList = async (id: number) => {
        if (!id) return
        try {
            const { data } = await axios.get(`${API_BASE_URL}/follow?userId=${id}`, { withCredentials: true })
            setFollowList(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('팔로우 목록 조회 실패:', error)
            setFollowList([])
        }
    }

    const fetchStatsData = async (id: number) => {
        if (!id) return
        try {
            const { data } = await axios.get(`${API_BASE_URL}/stats?userId=${id}`, { withCredentials: true })
            setStats(data)
        } catch (error) {
            console.error('통계 조회 실패:', error)
        }
    }

    const fetchMyReviews = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/reviews`, {
                withCredentials: true,
            })

            if (data.resultCode === '200') {
                setMyReviews(data.data)
            } else {
                alert(`리뷰 조회 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error(error)
            alert('리뷰 조회 중 오류가 발생했습니다.')
        }
    }

    // 카카오 주소 AIP
    const sample6_execDaumPostcode = () => {
        if (!window.daum || !window.daum.Postcode) {
            alert('카카오 우편번호 API가 아직 로드되지 않았습니다.')
            return
        }

        new window.daum.Postcode({
            oncomplete: function (data) {
                const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
                let extraAddr = ''

                if (data.userSelectedType === 'R') {
                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) extraAddr += data.bname
                    if (data.buildingName !== '' && data.apartment === 'Y')
                        extraAddr += extraAddr !== '' ? ', ' + data.buildingName : data.buildingName
                    if (extraAddr !== '') extraAddr = ' (' + extraAddr + ')'
                }

                //React state로 업데이트
                setNewAddress((prev) => ({
                    ...prev,
                    zipcode: data.zonecode,
                    baseAddress: addr,
                    extraAddress: extraAddr,
                }))
            },
        }).open()
    }

    // ------------------- 회원 정보 수정 -------------------
    const handleEdit = (section: string) => {
        if (!isAuthenticated) return alert('정보 수정을 위해 비밀번호 인증이 필요합니다.')
        setEditMode({ ...editMode, [section]: true })
        setTempData({ ...userData })
    }

    const handleSave = async (section: string) => {
        if (!userData?.id) return
        if (newPassword && newPassword !== confirmPassword)
            return alert('비밀번호와 확인 비밀번호가 일치하지 않습니다.')

        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/me/${userData.id}`,
                {
                    nickName: tempData.nickName,
                    email: tempData.email,
                    mobilePhone: tempData.mobilePhone,
                    ...(newPassword ? { password: newPassword } : {}),
                },
                { withCredentials: true },
            )

            if (data.resultCode === '200' && data.data) {
                setUserData(data.data)
                setEditMode({ ...editMode, [section]: false })
                setNewPassword('')
                setConfirmPassword('')
                alert(data.msg || '정보가 수정되었습니다.')
            } else {
                console.error('정보 수정 실패:', data)
                alert(`수정에 실패했습니다: ${data.msg || '오류가 발생했습니다.'}`)
            }
        } catch (error: any) {
            console.error('정보 수정 실패:', error.response?.data || error.message)
            alert('수정에 실패했습니다.')
        }
    }

    const handleCancel = (section: string) => {
        setTempData({ ...userData })
        setEditMode({ ...editMode, [section]: false })
    }

    // ------------------- 주문, 배송 -------------------
    const handleStatusClick = (status: string) => {
        setSelectedStatus(status)
        setIsStatusModal(true)
    }

    const handleOrderClick = (order: string) => {
        setSelectedOrder(order)
        setIsOrderModal(true)
    }

    //------------------- 배송지 -------------------
    const handleSaveAddress = async () => {
        if (!newAddress.recipientName || !newAddress.baseAddress || !newAddress.detailAddress) {
            return alert('이름과 주소를 모두 입력해주세요.')
        }

        try {
            const { data } = await axios.post(`${API_BASE_URL}/addresses`, newAddress, { withCredentials: true })

            if (data.resultCode === '200') {
                const savedAddress = data.data
                
                if (newAddress.isDefault) {
                    await axios.patch(`${API_BASE_URL}/addresses/${data.data.userAddressId}/default`, {}, { withCredentials: true })
                }

                setAddresses((prev) => {
                    const updated = prev.map((addr) =>
                        newAddress.isDefault ? { ...addr, isDefault: false } : addr
                    )
                    return [...updated, savedAddress]
                })
                
                alert('배송지 등록 성공')
                await fetchAddresses(userData.id)
                setIsAddressModal(false) // 모달 닫기
                setNewAddress({
                    recipientName: '',
                    zipcode: '',
                    baseAddress: '',
                    detailAddress: '',
                    extraAddress: '',
                    isDefault: false,
                })
            } else {
                alert(`등록 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error(error)
            alert('배송지 등록 중 오류가 발생했습니다.')
        }
    }

    const handleDeleteAddress = async (addressId: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            const { data } = await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, { withCredentials: true })
            console.log('삭제 서버 응답:', data)

            if (data.resultCode === '200') {
                alert('배송지 삭제 성공')
                setAddresses((prev) => prev.filter((addr) => addr.userAddressId !== addressId))
            } else {
                alert(`삭제 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('삭제 실패:', error)
            alert('배송지 삭제 중 오류가 발생했습니다.')
        }
    }

    const handleUpdateAddress = async () => {
        if (!editAddressData) return

        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/addresses/${editAddressData.userAddressId}`,
                editAddressData,
                { withCredentials: true },
            )

            if (data.resultCode === '200') {
                const updatedAddress = data.data

                if (editAddressData.isDefault) {
                    await axios.patch(
                        `${API_BASE_URL}/addresses/${editAddressData.userAddressId}/default`,
                        {},
                        { withCredentials: true }
                    )
                }

                setAddresses((prev) =>
                    prev.map((addr) => {
                        if (addr.userAddressId === updatedAddress.userAddressId) return updatedAddress;
                        if (editAddressData.isDefault) return { ...addr, isDefault: false }
                        return addr
                    })
                )

                alert('배송지 수정 성공')
                setAddresses((prev) =>
                    prev.map((addr) => (addr.userAddressId === editAddressData.userAddressId ? editAddressData : addr)),
                )
                setEditAddressModal(false)
            } else {
                alert(`수정 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error(error)
            alert('배송지 수정 중 오류가 발생했습니다.')
        }
    }

    // ------------------- 결제수단 -------------------
    const resetPaymentForm = () => {
        setPaymentType('BANK')
        setBankName('')
        setAccountNumber('')
        setCardCompany('')
        setCardNumber('')
        setDefaultPayment(false)
    }

    const handleSavePayment = async () => {
        if (paymentType === 'BANK' && (!bankName || !accountNumber)) {
        return alert('은행명과 계좌번호를 입력해주세요.')
        }
        if (paymentType === 'CARD' && (!cardCompany || !cardNumber)) {
        return alert('카드사와 카드번호를 입력해주세요.')
        }

        const newPayment = {
        type: paymentType,
        bankName,
        accountNumber,
        cardCompany,
        cardNumber,
        defaultPayment,
        }

        try {
        const { data } = await axios.post(
            `${API_BASE_URL}/payment-methods`,
            newPayment,
            { withCredentials: true }
        )

        if (data.resultCode === '200') {
            alert('결제수단 등록 성공')
            await fetchPaymentMethods()
            setIsPaymentModal(false)
            resetPaymentForm()
        } else {
            alert(`등록 실패: ${data.msg}`)
        }
        } catch (error) {
        console.error(error)
        alert('결제수단 등록 중 오류가 발생했습니다.')
        }
    }

    const handleDeletePayment = async (paymentId) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
        await axios.delete(`${API_BASE_URL}/payment-methods/${paymentId}`, {
            withCredentials: true,
        })
        alert('삭제 성공')
        fetchPaymentMethods()
        } catch (error) {
        console.error(error)
        alert('삭제 중 오류가 발생했습니다.')
        }
    }

    const handleSetDefault = async (paymentId) => {
        try {
        const { data } = await axios.patch(
            `${API_BASE_URL}/payment-methods/${paymentId}/default`,
            {},
            { withCredentials: true }
        )
        if (data.resultCode === '200') {
            fetchPaymentMethods()
        } else {
            alert(`실패: ${data.msg}`)
        }
        } catch (error) {
        console.error(error)
        alert('기본 결제수단 설정 중 오류가 발생했습니다.')
        }
    }

    // ------------------- 팔로우 -------------------
    const handleFollow = async (studioId: number) => {
        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/follow`,
                { studioId },
                { withCredentials: true }
            )

            if (data.resultCode === '200') {
                alert('팔로우 성공')
                fetchFollowList(userData.id)
            } else {
                alert(`팔로우 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('팔로우 실패:', error)
            alert('팔로우 요청 중 오류가 발생했습니다.')
        }
    }

    const handleUnfollow = async (studioId: number) => {
        try {
            const { data } = await axios.delete(`${API_BASE_URL}/follow`, {
                params: { studioId },
                withCredentials: true
            })

            if (data.resultCode === '200') {
                alert('언팔로우 성공')
                fetchFollowList(userData.id)
            } else {
                alert(`언팔로우 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('언팔로우 실패:', error)
            alert('언팔로우 중 오류가 발생했습니다.')
        }
    }

    const checkFollowing = async (studioId: number) => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/follow/check`, {
                params: { studioId },
                withCredentials: true
            })
            return data.data // true or false
        } catch (error) {
            console.error('팔로우 여부 확인 실패:', error)
            return false
        }
    }

    // ------------------- 비밀번호 인증 -------------------
    const handleVerifyPassword = async () => {
        if (!passwordInput) return alert('비밀번호를 입력해주세요.')
        try {
            const { data } = await axios.post(`${API_BASE_URL}/me/verify-password`, {
                userId: userData.id,
                password: passwordInput,
            }, { withCredentials: true })

            if (data.resultCode === '200') {
                setIsAuthenticated(true)
                alert('비밀번호 인증 완료. 정보 수정을 진행할 수 있습니다.')
            } else {
                alert('비밀번호가 올바르지 않습니다.')
            }
        } catch (error) {
            console.error('비밀번호 인증 실패:', error)
            alert('인증 중 오류가 발생했습니다.')
        }
    }

    // ------------------- 로딩 / 로그인 체크 -------------------
    if (loading) return <div>로딩중...</div>
    if (!userData)
        return (
            <div>
                로그인이 필요합니다. <button onClick={() => (window.location.href = '/auth/login')}>로그인하기</button>
            </div>
        )

    // ------------------- 클릭 시 수정 취소 -------------------
    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName)
        setEditMode({})
        setTempData({ ...userData })
    }

    /** ------------------- 렌더링 ------------------- */
    return (
        <div className="mypage-container">
            {/* 왼쪽 사이드바 */}
            <div className="mypage-sidebar">
                <h1>{userData.userName}</h1>

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
                                    className={`nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('wishlist')}
                                >
                                    나의 좋아요
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h2>고객센터</h2>
                        <ul>
                            <li>상품 문의 내역</li>
                        </ul>
                    </div>
                </nav>
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
                                        <div className="profile-image"></div>
                                    </td>
                                    <td>{stats.totalInquiries || 0}</td>
                                    <td>{stats.totalReviews || 0}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 주문배송조회 */}
                    {activeTab === 'orders' && (
                        <div className="tab-content">
                            <div className="delivery-status-summary">
                                {['배송 준비중', '배송 중', '배송 완료'].map((status) => (
                                    <div
                                        key={status}
                                        className="status-card"
                                        onClick={() => {
                                            setSelectedStatus(status);
                                            setIsStatusModal(true);
                                        }}
                                    >
                                        <p>{status}</p>
                                        <p>{orders.filter((o) => o.deliveryStatus === status).length}</p>
                                    </div>
                                ))}
                            </div>

                            {isStatusModal && (
                                <div className="orders-modal" onClick={() => setIsStatusModal(false)}>
                                    <div className="orders-modal-content" onClick={(e) => e.stopPropagation()}>
                                        <button className="orders-modal-close" onClick={() => setIsStatusModal(false)}>&times;</button>
                                        <h2>{selectedStatus}</h2>

                                        {orders.filter((o) => o.deliveryStatus === selectedStatus).length === 0 ? (
                                            <p>주문 내역이 없습니다.</p>
                                        ) : (
                                            orders
                                                .filter((o) => o.deliveryStatus === selectedStatus)
                                                .map((order) => (
                                                    <div key={order.orderId} className="order-card">
                                                        <div className="order-header">
                                                            <p>{order.createdDate} | 주문번호: {order.orderCord}</p>
                                                            <span>{order.deliveryStatus}</span>
                                                        </div>

                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="order-item">
                                                                <p>{item.productName}</p>
                                                                <p>{item.price?.toLocaleString()}원 / {item.quantity}개</p>
                                                            </div>
                                                        ))}

                                                        <div className="order-footer">
                                                            {order.trackingNumber && <p>운송장: {order.trackingNumber}</p>}
                                                            <p>총 {order.totalPrice?.toLocaleString()}원</p>
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </div>
                            )}


                            <div className="section-header">
                                <h2>최근 주문</h2>
                                <button className="btn-primary" onClick={() => setIsOrdersModal(true)}>
                                    더보기 <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="recent-orders">
                                {orders.slice(0, 3).map((order) => (
                                <div
                                    key={order.orderId}
                                    className="order-card"
                                    onClick={() => {
                                    setSelectedOrder(order);
                                    setIsOrderModal(true);
                                    }}
                                >
                                    <p>{order.createdDate}</p>
                                    <p>주문번호: {order.orderCord}</p>
                                    <p>총 {order.totalPrice}원</p>
                                </div>
                                ))}
                            </div>

                            {isOrdersModal && (
                                <div
                                    className="orders-modal"
                                    onClick={() => setIsOrdersModal(false)} // 바깥 클릭 시 닫힘
                                >
                                    <div
                                        className="orders-modal-content"
                                        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않게
                                    >
                                        <button className="orders-modal-close" onClick={() => setIsOrdersModal(false)}>
                                            &times;
                                        </button>

                                        <h2 style={{ marginBottom: '10px' }}>상세주문 확인</h2>
                                        <p>상세주문 폼</p>
                                    </div>
                                </div>
                            )}

                            {orders.length === 0 ? (
                                <div className="empty-state">주문 내역이 없습니다.</div>
                            ) : (
                                <div className="orders-list">
                                    {orders.map((order) => (
                                        <div key={order.orderId} className="order-card">
                                            {/* 주문 헤더 */}
                                            <div className="order-header">
                                                <div>
                                                    <p className="order-date">{order.createdDate}</p>
                                                    <p className="order-number">주문번호: {order.orderCord}</p>
                                                </div>
                                                <span className="order-status">{order.deliveryStatus}</span>
                                            </div>

                                            {/* 주문 상품 목록 */}
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, idx) => (
                                                    <div key={idx} className="order-item">
                                                        <p className="order-item-name">{item.productName}</p>
                                                        <p className="order-item-detail">
                                                            {item.price?.toLocaleString()}원 / {item.quantity}개
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="order-item-empty">상품 정보가 없습니다.</div>
                                            )}

                                            {/* 주문 푸터 */}
                                            <div className="order-footer">
                                                {order.trackingNumber && (
                                                    <p className="order-tracking">운송장: {order.trackingNumber}</p>
                                                )}
                                                <p className="order-total">
                                                    총 {order.totalPrice?.toLocaleString()}원
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isOrderModal && selectedOrder && (
                                <div className="modal-backdrop" onClick={() => setIsOrderModal(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => setIsOrderModal(false)}>닫기</button>
                                    <h2>주문 상세</h2>
                                    {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="order-item">
                                        <p>{item.productName}</p>
                                        <p>{item.price}원 × {item.quantity}</p>
                                    </div>
                                    ))}
                                    <p>총 {selectedOrder.totalPrice}원</p>
                                </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 회원정보수정 */}
                    {activeTab === 'profile' && (
                        <div className="tab-content">
                            {/* 비밀번호 인증 */}
                            {!isAuthenticated ? (
                                <div className="auth-banner">
                                    <span>정보 수정을 위해 비밀번호 인증이 필요합니다</span>
                                    <input
                                        type="password"
                                        placeholder="현재 비밀번호 입력"
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                    />
                                    <button onClick={handleVerifyPassword}>인증 확인</button>
                                </div>
                            ) : (
                                <div className="auth-banner success">
                                    인증 완료
                                </div>
                            )}

                            <div className="section-header">
                                <h2>회원정보수정</h2>
                                {!editMode.profile ? (
                                    <button className="btn-primary" onClick={() => handleEdit('profile')}>
                                        수정
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-primary" onClick={() => handleSave('profile')}>
                                            저장
                                        </button>
                                        <button className="btn-secondary" onClick={() => handleCancel('profile')}>
                                            취소
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="form-group">
                                    <label>이름</label>
                                    <p>{userData.userName}</p> {/* 읽기 전용 */}
                                </div>

                                <div className="form-group">
                                    <label>닉네임</label>
                                    {editMode.profile ? (
                                        <input
                                            type="text"
                                            value={tempData.nickName || ''}
                                            onChange={(e) => setTempData({ ...tempData, nickName: e.target.value })}
                                            className="editable"
                                        />
                                    ) : (
                                        <p>{userData.nickName}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>비밀번호</label>
                                    {editMode.profile ? (
                                        <input
                                            type="password"
                                            placeholder="새 비밀번호 입력"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="editable"
                                        />
                                    ) : (
                                        <p>********</p>
                                    )}
                                </div>

                                {editMode.profile && (
                                    <div className="form-group">
                                        <label>비밀번호 확인</label>
                                        <input
                                            type="password"
                                            placeholder="비밀번호 재입력"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>이메일</label>
                                    {editMode.profile ? (
                                        <input
                                            type="email"
                                            value={tempData.email || ''}
                                            onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                                            className="editable"
                                        />
                                    ) : (
                                        <p>{userData.email}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>휴대폰</label>
                                    {editMode.profile ? (
                                        <input
                                            type="tel"
                                            value={tempData.mobilePhone || ''}
                                            onChange={(e) => setTempData({ ...tempData, mobilePhone: e.target.value })}
                                            className="editable"
                                        />
                                    ) : (
                                        <p>{userData.mobilePhone}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>생년월일</label>
                                    <p>{userData.birth}</p>
                                </div>

                                <div className="form-group">
                                    <label>성별</label>
                                    <p>{userData.gender === 'MALE' ? '남성' : '여성'}</p>
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
                            {isAddressModal && (
                                <div
                                    className="address-modal"
                                    onClick={() => setIsAddressModal(false)} // 바깥 클릭 시 닫힘
                                >
                                    <div
                                        className="address-modal-content"
                                        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않게
                                    >
                                        <button
                                            className="address-modal-close"
                                            onClick={() => setIsAddressModal(false)}
                                        >
                                            &times;
                                        </button>

                                        <h2 style={{ marginBottom: '10px' }}>새 배송지 추가</h2>
                                        <input
                                            type="text"
                                            placeholder="수령인 이름"
                                            value={newAddress.recipientName}
                                            onChange={(e) =>
                                                setNewAddress({ ...newAddress, recipientName: e.target.value })
                                            }
                                        />
                                        <br />

                                        <input
                                            type="text"
                                            id="sample6_postcode"
                                            placeholder="우편번호"
                                            value={newAddress.zipcode}
                                            readOnly
                                        />

                                        {/* 여기서 onClick을 React 방식으로 */}
                                        <input
                                            type="button"
                                            value="우편번호 찾기"
                                            onClick={sample6_execDaumPostcode}
                                            className="btn-primary"
                                        />
                                        <br />

                                        <input
                                            type="text"
                                            id="sample6_address"
                                            placeholder="주소"
                                            value={newAddress.baseAddress}
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            id="sample6_extraAddress"
                                            placeholder="참고항목"
                                            value={newAddress.extraAddress}
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            id="sample6_detailAddress"
                                            placeholder="상세주소"
                                            value={newAddress.detailAddress}
                                            onChange={(e) =>
                                                setNewAddress({ ...newAddress, detailAddress: e.target.value })
                                            }
                                        />
                                        <br />
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newAddress.isDefault}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, isDefault: e.target.checked })
                                                }
                                            />
                                            기본 배송지로 설정
                                        </label>
                                        <br />

                                        <button className="btn-primary" onClick={handleSaveAddress}>
                                            저장
                                        </button>
                                    </div>
                                </div>
                            )}

                            {addresses.length === 0 ? (
                                <div className="empty-state">등록된 배송지가 없습니다.</div>
                            ) : (
                                <div>
                                    {addresses.map((addr) => (
                                        <div key={addr.userAddressId} className="address-card">
                                            <div className="card-header">
                                                <div className="card-title">
                                                    <span>
                                                        {addr.recipientName}
                                                    </span>
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

                            {editAddressModal && editAddressData && (
                                <div className="address-modal" onClick={() => setEditAddressModal(false)}>
                                    <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="address-modal-close"
                                            onClick={() => setEditAddressModal(false)}
                                        >
                                            &times;
                                        </button>

                                        <h2>배송지 수정</h2>

                                        <input
                                            type="text"
                                            placeholder="수령인 이름"
                                            value={editAddressData.recipientName}
                                            onChange={(e) =>
                                                setEditAddressData({
                                                    ...editAddressData,
                                                    recipientName: e.target.value,
                                                })
                                            }
                                        />
                                        <input
                                            type="text"
                                            placeholder="우편번호"
                                            value={editAddressData.zipcode}
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            placeholder="주소"
                                            value={editAddressData.baseAddress}
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            placeholder="참고항목"
                                            value={editAddressData.extraAddress}
                                            onChange={(e) =>
                                                setEditAddressData({ ...editAddressData, extraAddress: e.target.value })
                                            }
                                        />
                                        <input
                                            type="text"
                                            placeholder="상세주소"
                                            value={editAddressData.detailAddress}
                                            onChange={(e) =>
                                                setEditAddressData({
                                                    ...editAddressData,
                                                    detailAddress: e.target.value,
                                                })
                                            }
                                        />
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={editAddressData.isDefault}
                                                onChange={(e) =>
                                                    setEditAddressData({
                                                        ...editAddressData,
                                                        isDefault: e.target.checked,
                                                    })
                                                }
                                            />
                                            기본 배송지로 설정
                                        </label>

                                        <button className="btn-primary" onClick={handleUpdateAddress}>
                                            저장
                                        </button>
                                    </div>
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

                            {/* 결제수단 추가 모달 */}
                            {isPaymentModal && (
                                <div
                                    className="payment-modal"
                                    onClick={() => setIsPaymentModal(false)}
                                >
                                    <div
                                        className="payment-modal-content"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            className="payment-modal-close"
                                            onClick={() => setIsPaymentModal(false)}
                                        >
                                            &times;
                                        </button>

                                        <h2>새 결제수단 추가</h2>

                                        {/* 폼 */}
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                await handleSavePayment();
                                            }}
                                            className="space-y-4"
                                        >
                                            {/* 결제 타입 */}
                                            <div>
                                                <label>결제수단 종류</label>
                                                <select
                                                    value={paymentType}
                                                    onChange={(e) => setPaymentType(e.target.value)}
                                                >
                                                    <option value="BANK">은행 계좌</option>
                                                    <option value="CARD">신용/체크카드</option>
                                                </select>
                                            </div>

                                            {/* 은행 계좌 */}
                                            {paymentType === 'BANK' && (
                                                <>
                                                    <div>
                                                        <label>은행명</label>
                                                        <input
                                                            type="text"
                                                            value={bankName}
                                                            onChange={(e) => setBankName(e.target.value)}
                                                            placeholder="예: 신한은행"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label>계좌번호</label>
                                                        <input
                                                            type="text"
                                                            value={accountNumber}
                                                            onChange={(e) => setAccountNumber(e.target.value)}
                                                            placeholder="123-4567-8901-23"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* 카드 */}
                                            {paymentType === 'CARD' && (
                                                <>
                                                    <div>
                                                        <label>카드사</label>
                                                        <input
                                                            type="text"
                                                            value={cardCompany}
                                                            onChange={(e) => setCardCompany(e.target.value)}
                                                            placeholder="예: 현대카드"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label>카드번호</label>
                                                        <input
                                                            type="text"
                                                            value={cardNumber}
                                                            onChange={(e) => setCardNumber(e.target.value)}
                                                            placeholder="1234-5678-9012-3456"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* 기본 결제수단 */}
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    checked={defaultPayment}
                                                    onChange={(e) => setDefaultPayment(e.target.checked)}
                                                />
                                                <span>기본 결제수단으로 설정</span>
                                            </div>

                                            {/* 버튼 */}
                                            <div className="modal-buttons">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPaymentModal(false)}
                                                    className="btn-secondary"
                                                >
                                                    취소
                                                </button>
                                                <button type="submit" className="btn-primary">
                                                    등록
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* 결제수단 목록 */}
                            {paymentMethods.length === 0 ? (
                                <div className="empty-state">등록된 결제수단이 없습니다.</div>
                            ) : (
                                <div>
                                    {paymentMethods.map((method) => (
                                        <div key={method.paymentId} className="payment-card">
                                            <div className="card-header">
                                                <div>
                                                    <div className="card-title">
                                                        <span>{method.type === 'CARD' ? '신용카드' : '계좌이체'}</span>
                                                        {method.defaultPayment && (
                                                            <span className="badge">기본결제</span>
                                                        )}
                                                    </div>
                                                    <div className="card-content" style={{ marginTop: '8px' }}>
                                                        <p>{method.cardCompany || method.bankName}</p>
                                                        <p>{method.cardNumber || method.accountNumber}</p>
                                                    </div>
                                                </div>

                                                <div className="card-actions">
                                                    <button
                                                        className="link-btn"
                                                        onClick={() => handleSetDefault(method.paymentId)}
                                                    >
                                                        기본설정
                                                    </button>
                                                    <button
                                                        className="link-btn delete"
                                                        onClick={() => handleDeletePayment(method.paymentId)}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 나의 좋아요, 팔로우 */}
                    {activeTab === 'wishlist' && (
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
                                    className={`subtab-btn ${activeSubTab === 'brand' ? 'active' : ''}`}
                                    onClick={() => setActiveSubTab('brand')}
                                >
                                    Brand
                                </button>
                            </div>

                            {activeSubTab === 'product' && (
                                <div className="subtab-content">
                                    {wishList.length === 0 ? (
                                        <div className="empty-state">좋아요한 상품이 없습니다.</div>
                                    ) : (
                                        <div className="wishlist-grid">
                                            {wishList.map((item) => (
                                                <div key={item.wishlistId} className="wishlist-item">
                                                    <div className="wishlist-image"></div>
                                                    <div className="wishlist-info">
                                                        <p>{item.productName}</p>
                                                        <p className="price">{item.price?.toLocaleString()}원</p>
                                                        <button
                                                            className="link-btn delete"
                                                            onClick={() => handleRemoveWish(item.wishlistId)}
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeSubTab === 'follow' && (
                                <div className="tab-content">
                                    <h2>내가 팔로우한 작가</h2>
                                    {followList.length === 0 ? (
                                        <p>팔로우한 작가가 없습니다.</p>
                                    ) : (
                                        <ul className="follow-list">
                                            {followList.map((follow) => (
                                                <li key={follow.studioId} className="follow-card">
                                                    <p>{follow.studioName}</p>
                                                    <button onClick={() => handleUnfollow(follow.studioId)}>
                                                        언팔로우
                                                    </button>
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

                            {myReviews.length === 0 ? (
                                <div className="empty-state">작성한 리뷰가 없습니다.</div>
                            ) : (
                                <div className="my-review-list">
                                    {myReviews.map((review) => (
                                        <div key={review.reviewId} className="my-review-card">
                                            <div className="my-review-header">
                                                <span className="my-review-product-name">상품 ID: {review.productId}</span>
                                                <span className="my-review-rating">⭐ {review.rating} / 5</span>
                                            </div>

                                            <div className="my-review-content">{review.content}</div>

                                            <div className="my-review-footer">
                                                <span>작성일: {review.createdDate}</span>
                                                {review.modifiedDate && (
                                                    <span> · 수정일: {review.modifiedDate}</span>
                                                )}
                                                <span className="my-review-like-count">👍 {review.reviewLike}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
