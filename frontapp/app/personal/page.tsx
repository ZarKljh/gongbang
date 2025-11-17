'use client'

import axios from 'axios'
import { useState, useEffect } from 'react'
import '@/app/personal/page.css'
import Link from 'next/link'

const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

export default function MyPage() {
    // =============== 타입 정의 ===============
    interface OrdersResponse {
        orderId: number
        userId: number
        orderCode: string
        totalPrice: number
        createdDate: string
        deliveryStatus: string
        completedAt?: string
        items: OrderItemResponse[]
        deliveries?: DeliveryResponse[]
    }

    interface OrderItemResponse {
        orderItemId: number
        orderId: number
        productId: number
        productName: string
        quantity: number
        price: number
    }

    interface DeliveryResponse {
        deliveryId: number
        orderId: number
        addressId: number
        trackingNumber: string | null
        deliveryStatus: string
        completedAt: string | null // 백엔드에서 String으로 내려주는 것
        createdDate: string | null
        modifiedDate: string | null

        // 배송지 정보
        recipientName: string | null
        baseAddress: string | null
        detailAddress: string | null
        zipcode: string | null
    }

    // =============== State 관리 ===============
    // 사용자 정보
    const [userData, setUserData] = useState<any>(null)
    const [tempData, setTempData] = useState<any>(null)
    const [stats, setStats] = useState<any>({
        totalQna: 0,
        totalReviews: 0,
    })

    // UI 상태
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('orders')
    const [activeSubTab, setActiveSubTab] = useState('product')
    const [editMode, setEditMode] = useState({})

    // 인증
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [passwordInput, setPasswordInput] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // 주문/배송
    const [orders, setOrders] = useState<any[]>([])
    const [openOrderId, setOpenOrderId] = useState(null)
    const [selectedStatus, setSelectedStatus] = useState(null)
    const [isStatusModal, setIsStatusModal] = useState(false)
    const [activeFilter, setActiveFilter] = useState('전체')
    const [openedOrderId, setOpenedOrderId] = useState<number | null>(null)

    // 배송지
    const [addresses, setAddresses] = useState<any[]>([])
    const [isAddressModal, setIsAddressModal] = useState(false)
    const [editAddressModal, setEditAddressModal] = useState(false)
    const [editAddressData, setEditAddressData] = useState<any>(null)
    const [newAddress, setNewAddress] = useState({
        recipientName: '',
        zipcode: '',
        baseAddress: '',
        detailAddress: '',
        extraAddress: '',
        isDefault: false,
    })

    // 결제수단
    const [paymentMethods, setPaymentMethods] = useState([])
    const [isPaymentModal, setIsPaymentModal] = useState(false)
    const [paymentType, setPaymentType] = useState('BANK')
    const [bankName, setBankName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [cardCompany, setCardCompany] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [defaultPayment, setDefaultPayment] = useState(false)

    // 리뷰
    const [myReviews, setMyReviews] = useState<any[]>([])
    const [isEditReviewModal, setIsEditReviewModal] = useState(false)
    const [isDeleteReviewModal, setIsDeleteReviewModal] = useState(false)
    const [editReview, setEditReview] = useState<any>(null)
    const [reviewToDelete, setReviewToDelete] = useState<any>(null)
    const [editReviewContent, setEditReviewContent] = useState('')
    const [editReviewRating, setEditReviewRating] = useState(0)

    // 위시리스트/팔로우
    const [wishList, setWishList] = useState<any[]>([])
    const [followList, setFollowList] = useState<any[]>([])

    // 장바구니
    const [cart, setCart] = useState<any[]>([])

    //문의
    const [qna, setQna] = useState<any[]>([])
    const [openQnaId, setOpenQnaId] = useState(null)

    // =============== Effects ===============
    useEffect(() => {
        const init = async () => {
            setLoading(true)
            try {
                const user = await fetchUser()
                if (!user || !user.id) return

                await loadAllData(user.id)
            } catch (error) {
                console.error('초기 데이터 로딩 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        init()
    }, [])

    useEffect(() => {
        console.log('orders state:', orders)
    }, [orders])

    useEffect(() => {
        if (isAddressModal && !window.daum) {
            const script = document.createElement('script')
            script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
            script.async = true
            document.body.appendChild(script)
        }
    }, [isAddressModal])

    // =============== API 호출 함수 ===============
    const loadAllData = async (userId: number) => {
        try {
            await Promise.all([
                fetchOrders(userId),
                fetchAddresses(userId),
                fetchPaymentMethods(userId),
                fetchWishList(userId),
                fetchFollowList(userId),
                fetchStatsData(userId),
                fetchMyReviews(userId),
                fetchCart(userId),
                fetchQna(userId),
            ])
        } catch (error) {
            console.error('데이터 로드 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUser = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/me`, { withCredentials: true })
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

    const filteredOrders = orders.filter((order) => {
        if (activeFilter === "전체") return ["주문취소", "반품완료", "교환완료"].includes(order.deliveryStatus)
        if (activeFilter === "취소") return order.deliveryStatus === "주문취소"
        if (activeFilter === "반품") return order.deliveryStatus === "반품완료"
        if (activeFilter === "교환") return order.deliveryStatus === "교환완료"
        return true
    })

    const fetchOrders = async (id?: number) => {
        if (!id) return

        try {
            const { data } = await axios.get(`${API_BASE_URL}/orders`, {withCredentials: true,})
            console.log('orders axios data:', data)
            setOrders(data.data || [])
        } catch (error) {
            console.error('주문 내역 조회 실패:', error)
            setOrders([])
        }
    }

    const fetchDelivery = async (orderId: number) => {
        const res = await axios.get(`${API_BASE_URL}/orders/${orderId}/delivery`)
        return res.data.data
    }

    const fetchCart = async (id?: number) => {
        if (!id) return
        try {
            const { data } = await axios.get(`${API_BASE_URL}/cart`, {withCredentials: true,})
            setCart(Array.isArray(data.data) ? data.data : data)
        } catch (error) {
            console.error('장바구니 목록 조회 실패:', error)
            setCart([])
        }
    }

    const fetchAddresses = async (id?: number) => {
        const userId = id || userData?.id
        if (!userId) return

        try {
            const response = await axios.get(`${API_BASE_URL}/addresses?userId=${userId}`, {
                withCredentials: true,
            })
            const addressesData = response.data?.data || []
            const cleaned = flattenAddresses(addressesData)
            setAddresses(cleaned)
        } catch (error) {
            console.error('배송지 조회 실패:', error)
            setAddresses([])
        }
    }

    const fetchPaymentMethods = async (id?: number) => {
        const userId = id || userData?.id
        if (!userId) return

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
            console.error('결제수단 조회 실패:', error)
            alert('결제수단 조회 중 오류가 발생했습니다.')
        }
    }

    const fetchWishList = async (id?: number) => {
        if (!id) return
        try {
            const { data } = await axios.get(`${API_BASE_URL}/wishlist`, { withCredentials: true, })
            setWishList(Array.isArray(data.data) ? data.data : data)
        } catch (error) {
            console.error('위시 목록 조회 실패:', error)
            setWishList([])
        }
    }

    const fetchFollowList = async (id?: number) => {
        if (!id) return
        try {
            const { data } = await axios.get(`${API_BASE_URL}/follow?userId=${id}`, {
                withCredentials: true,
            })
            setFollowList(Array.isArray(data.data) ? data.data : [])
        } catch (error) {
            console.error('팔로우 목록 조회 실패:', error)
            setFollowList([])
        }
    }

    const fetchStatsData = async (id?: number) => {
        const userId = id || userData?.id
        if (!userId) return

        try {
            const { data } = await axios.get(`${API_BASE_URL}/stats?userId=${userId}`, {
                withCredentials: true,
            })
            setStats(data)
        } catch (error) {
            console.error('통계 조회 실패:', error)
        }
    }

    const fetchMyReviews = async (id?: number) => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/reviews`, { withCredentials: true })
            const list = data.data || []
            setMyReviews(list)
            setStats((prev) => ({
                ...prev,
                totalReviews: Array.isArray(list) ? list.length : 0,
            }))
        } catch (error) {
            console.error('리뷰 조회 실패:', error)
            setStats((prev) => ({
                ...prev,
                totalReviews: 0,
            }))
        }
    }

    const fetchQna = async (id?: number) => {
        const userId = id || userData?.id
        if (!userId) return
        
        try {
            const response = await axios.get(`${API_BASE_URL}/qna?userId=${userId}`, {
                withCredentials: true,
            })
            const list = Array.isArray(response.data.data) ? response.data.data : []
            setQna(list)
            setStats((prev) => ({
                ...prev,
                totalQna: list.length,
            }))
        } catch (error) {
            console.error('문의 목록 조회 실패:', error)
            setQna([])
            setStats((prev) => ({
                ...prev,
                totalQna: 0,
            }))
        }
    }

    // =============== 유틸리티 함수 ===============
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

    const resetAddressForm = () => {
        setNewAddress({
            recipientName: '',
            zipcode: '',
            baseAddress: '',
            detailAddress: '',
            extraAddress: '',
            isDefault: false,
        })
    }

    const resetPaymentForm = () => {
        setPaymentType('BANK')
        setBankName('')
        setAccountNumber('')
        setCardCompany('')
        setCardNumber('')
        setDefaultPayment(false)
    }

    const sample6_execDaumPostcode = () => {
        if (!window.daum || !window.daum.Postcode) {
            alert('카카오 우편번호 API가 아직 로드되지 않았습니다.')
            return
        }

        new window.daum.Postcode({
            oncomplete: (data) => {
                const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
                let extraAddr = ''

                if (data.userSelectedType === 'R') {
                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                        extraAddr += data.bname
                    }
                    if (data.buildingName !== '' && data.apartment === 'Y') {
                        extraAddr += extraAddr !== '' ? ', ' + data.buildingName : data.buildingName
                    }
                    if (extraAddr !== '') {
                        extraAddr = ' (' + extraAddr + ')'
                    }
                }

                setNewAddress((prev) => ({
                    ...prev,
                    zipcode: data.zonecode,
                    baseAddress: addr,
                    extraAddress: extraAddr,
                }))
            },
        }).open()
    }

    // =============== 주문, 배송정보 ===============
    const isWithinSevenDays = (dateString?: string) => {
        if (!dateString) return false
        const completedDate = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - completedDate.getTime())
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        return diffDays <= 7
    }

    const toggleOrder = (id) => {
        setOpenOrderId((prev) => (prev === id ? null : id))
    }

    // ================= 주문 취소 / 반품 / 교환 =================
    const handleCancelOrder = async (orderId: number, reason: string) => {
        const order = orders.find((o) => o.orderId === orderId)
        if (!order) return alert("주문 정보를 찾을 수 없습니다.")
        if (order.deliveryStatus !== "배송준비중") {
            return alert("배송 준비중 상태일 때만 주문 취소가 가능합니다.")
        }

        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/orders/${orderId}/cancel`,
                { reason },
                { withCredentials: true }
            )

            if (data.resultCode === "200") {
                alert("주문이 취소되었습니다.")
                await fetchOrders(userData.id)
            } else {
                alert(`취소 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error("주문 취소 실패:", error)
            alert("주문 취소 중 오류가 발생했습니다.")
        }
    }

    const handleReturnOrder = async (orderId: number, reason: string) => {
        const order = orders.find((o) => o.orderId === orderId)
        if (!order) return alert("주문 정보를 찾을 수 없습니다.")
        if (order.deliveryStatus !== "배송완료") {
            return alert("배송 완료된 주문만 반품 신청이 가능합니다.")
        }

        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/orders/${orderId}/return`,
                { reason },
                { withCredentials: true }
            )

            if (data.resultCode === "200") {
                alert("반품 신청이 완료되었습니다.")
                await fetchOrders(userData.id)
            } else {
                alert(`반품 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error("반품 신청 실패:", error)
            alert("반품 신청 중 오류가 발생했습니다.")
        }
    }

    const handleExchangeOrder = async (orderId: number, reason: string) => {
        const order = orders.find((o) => o.orderId === orderId)
        if (!order) return alert("주문 정보를 찾을 수 없습니다.")
        if (order.deliveryStatus !== "배송완료") {
            return alert("배송 완료된 주문만 교환 신청이 가능합니다.")
        }

        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/orders/${orderId}/exchange`,
                { reason },
                { withCredentials: true }
            )

            if (data.resultCode === "200") {
                alert("교환 신청이 완료되었습니다.")
                await fetchOrders(userData.id)
            } else {
                alert(`교환 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error("교환 신청 실패:", error)
            alert("교환 신청 중 오류가 발생했습니다.")
        }
    }

    const toggleManageOrder = (orderId: number) => {
        setOpenedOrderId((prev) => (prev === orderId ? null : orderId))
    }

    const handleDeleteOrder = (orderId: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return

        axios.delete(`/api/orders/${orderId}`)
            .then(() => {
                setFilteredOrders(prev => prev.filter(o => o.orderId !== orderId))
            })
            .catch(err => console.error(err))
    }

    // =============== 회원정보 ===============
    const handleVerifyPassword = async () => {
        if (!passwordInput) {
            alert('비밀번호를 입력해주세요.')
            return
        }

        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/me/verify-password`,
                {
                    userId: userData.id,
                    password: passwordInput,
                },
                { withCredentials: true },
            )

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

    const handleEdit = (section: string) => {
        if (!isAuthenticated) {
            alert('정보 수정을 위해 비밀번호 인증이 필요합니다.')
            return
        }
        setEditMode({ ...editMode, [section]: true })
        setTempData({ ...userData })
    }

    // state 추가
    const [errors, setErrors] = useState({
    nickName: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    mobilePhone: '',
    })

    const handleSave = async (section: string) => {
        if (!userData?.id) return

        const newErrors = { nickName: '', newPassword: '', confirmPassword: '', email: '', mobilePhone: '' }
        let hasError = false

        // 닉네임 검증
        if (tempData.nickName?.trim()) {
            const nicknameRegex = /^[a-zA-Z0-9가-힣ㄱ-ㅎ]{2,12}$/
            if (!nicknameRegex.test(tempData.nickName)) {
                newErrors.nickName = '닉네임은 2~12자, 특수문자 없이 입력해주세요.'
                hasError = true
            }
        }

        // 새 비밀번호 검증
        if (newPassword?.trim()) {
            const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
            if (!pwRegex.test(newPassword)) {
                newErrors.newPassword = '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.'
                hasError = true
            }
            if (newPassword !== confirmPassword) {
                newErrors.confirmPassword = '비밀번호 확인이 일치하지 않습니다.'
                hasError = true
            }
        }

        // 이메일 검증
        if (tempData.email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(tempData.email)) {
                newErrors.email = '올바른 이메일 형식을 입력해주세요.'
                hasError = true
            }
        }

        // 휴대폰 검증
        if (tempData.mobilePhone?.trim()) {
            const phoneRegex = /^010\d{7,8}$/
            if (!phoneRegex.test(tempData.mobilePhone)) {
                newErrors.mobilePhone = '휴대폰 번호 형식이 올바르지 않습니다.'
                hasError = true
            }
        }

        setErrors(newErrors)

        if (hasError) return // 오류가 있으면 서버 호출 안함

        // 서버 호출
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
                setErrors({ nickName: '', newPassword: '', confirmPassword: '', email: '', mobilePhone: '' })
            }
        } catch (error: any) {
            console.error('정보 수정 실패:', error.response?.data || error.message)
        }
    }

    const handleCancel = (section: string) => {
        setTempData({ ...userData })
        setEditMode({ ...editMode, [section]: false })
    }

    // =============== 배송지 ===============
    const handleSaveAddress = async () => {
        if (!newAddress.recipientName || !newAddress.baseAddress || !newAddress.detailAddress) {
            alert('이름과 주소를 모두 입력해주세요.')
            return
        }

        try {
            const { data } = await axios.post(`${API_BASE_URL}/addresses`, newAddress, {
                withCredentials: true,
            })

            if (data.resultCode === '200') {
                if (newAddress.isDefault) {
                    await axios.patch(
                        `${API_BASE_URL}/addresses/${data.data.userAddressId}/default`,
                        {},
                        { withCredentials: true },
                    )
                }

                alert('배송지 등록 성공')
                await fetchAddresses(userData.id)
                setIsAddressModal(false)
                resetAddressForm()
            } else {
                alert(`등록 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('배송지 등록 실패:', error)
            alert('배송지 등록 중 오류가 발생했습니다.')
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
                if (editAddressData.isDefault) {
                    await axios.patch(
                        `${API_BASE_URL}/addresses/${editAddressData.userAddressId}/default`,
                        {},
                        { withCredentials: true },
                    )
                }

                alert('배송지 수정 성공')
                await fetchAddresses(userData.id)
                setEditAddressModal(false)
            } else {
                alert(`수정 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('배송지 수정 실패:', error)
            alert('배송지 수정 중 오류가 발생했습니다.')
        }
    }

    const handleDeleteAddress = async (addressId: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            const { data } = await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, {
                withCredentials: true,
            })

            if (data.resultCode === '200') {
                alert('배송지 삭제 성공')
                setAddresses((prev) => prev.filter((addr) => addr.userAddressId !== addressId))
            } else {
                alert(`삭제 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('배송지 삭제 실패:', error)
            alert('배송지 삭제 중 오류가 발생했습니다.')
        }
    }

    // =============== 결제수단 ===============
    const handleSavePayment = async () => {
        if (paymentType === 'BANK' && (!bankName || !accountNumber)) {
            alert('은행명과 계좌번호를 입력해주세요.')
            return
        }

        if (paymentType === 'CARD' && (!cardCompany || !cardNumber)) {
            alert('카드사와 카드번호를 입력해주세요.')
            return
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
            const { data } = await axios.post(`${API_BASE_URL}/payment-methods`, newPayment, { withCredentials: true })

            if (data.resultCode === '200') {
                alert('결제수단 등록 성공')
                await fetchPaymentMethods()
                setIsPaymentModal(false)
                resetPaymentForm()
            } else {
                alert(`등록 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('결제수단 등록 실패:', error)
            alert('결제수단 등록 중 오류가 발생했습니다.')
        }
    }

    const handleDeletePayment = async (paymentId: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            await axios.delete(`${API_BASE_URL}/payment-methods/${paymentId}`, {
                withCredentials: true,
            })
            alert('삭제 성공')
            await fetchPaymentMethods()
        } catch (error) {
            console.error('결제수단 삭제 실패:', error)
            alert('삭제 중 오류가 발생했습니다.')
        }
    }

    const handleSetDefault = async (paymentId: number) => {
        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/payment-methods/${paymentId}/default`,
                {},
                { withCredentials: true },
            )

            if (data.resultCode === '200') {
                await fetchPaymentMethods()
            } else {
                alert(`실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('기본 결제수단 설정 실패:', error)
            alert('기본 결제수단 설정 중 오류가 발생했습니다.')
        }
    }

    // =============== 리뷰 ===============
    const handleEditClick = (review: any) => {
        setEditReview(review)
        setEditReviewContent(review.content)
        setEditReviewRating(review.rating)
        setIsEditReviewModal(true)
    }

    const handleDeleteClick = (review: any) => {
        setReviewToDelete(review)
        setIsDeleteReviewModal(true)
    }

    const handleCloseModal = () => {
        setIsEditReviewModal(false)
        setIsDeleteReviewModal(false)
        setEditReview(null)
        setReviewToDelete(null)
        setEditReviewContent('')
        setEditReviewRating(0)
    }

    const handleSaveEdit = async () => {
        if (!editReview) return

        try {
            const { data } = await axios.patch(
                `http://localhost:8090/api/v1/reviews/${editReview.reviewId}`,
                { rating: editReviewRating, content: editReviewContent },
                { withCredentials: true },
            )

            if (data.resultCode === '200') {
                alert('리뷰가 수정되었습니다.')
                await fetchMyReviews()
                handleCloseModal()
            } else {
                alert(`수정 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('리뷰 수정 실패:', error)
            alert('리뷰 수정 중 오류가 발생했습니다.')
        }
    }

    const handleDeleteReview = async () => {
        if (!reviewToDelete) return

        try {
            const { data } = await axios.delete(`http://localhost:8090/api/v1/reviews/${reviewToDelete.reviewId}`, {
                withCredentials: true,
            })

            if (data.resultCode === '200') {
                alert('리뷰가 삭제되었습니다.')
                await fetchMyReviews()
                handleCloseModal()
            } else {
                alert(`삭제 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('리뷰 삭제 실패:', error)
            alert('리뷰 삭제 중 오류가 발생했습니다.')
        }
    }

    // ================= 리뷰 =================
    // 리뷰 이미지 업로드 핸들러
    const handleUploadReviewImage = async (reviewId: number, file: File) => {
        const formData = new FormData()
        formData.append("image", file)

        try {
            const { data } = await axios.post(
                `http://localhost:8090/api/v1/reviews/${reviewId}/image`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            )

            if (data.resultCode === "200") {
                alert("이미지가 업로드되었습니다.")
                await fetchMyReviews()
            } else {
                alert(`업로드 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error("리뷰 이미지 업로드 실패:", error)
            alert("이미지 업로드 중 오류가 발생했습니다.")
        }
    }

    // ================= Q&A 기능 =================
    // 문의 삭제
    const handleDeleteQna = async (qnaId: number) => {
        if (!confirm("정말 이 문의를 삭제하시겠습니까?")) return

        try {
            const { data } = await axios.delete(`${API_BASE_URL}/qna/${qnaId}`, { withCredentials: true })

            if (data.resultCode === "200") {
                alert("문의가 삭제되었습니다.")
                await fetchQna(userData.id)
            } else {
                alert(`삭제 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error("문의 삭제 실패:", error)
            alert("문의 삭제 중 오류가 발생했습니다.")
        }
    }

    const toggleQna = (id) => {
        setOpenQnaId(prev => (prev === id ? null : id))
    }

    // =============== 팔로우 ===============
    const handleUnfollow = async (studioId: number) => {
        try {
            const { data } = await axios.delete(`${API_BASE_URL}/follow`, {
                params: { studioId },
                withCredentials: true,
            })

            if (data.resultCode === '200') {
                alert('언팔로우 성공')
                await fetchFollowList(userData.id)
            } else {
                alert(`언팔로우 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('언팔로우 실패:', error)
            alert('언팔로우 중 오류가 발생했습니다.')
        }
    }

    const handleRemoveWish = async (wishlistId: number) => {
        try {
            const { data } = await axios.delete(`${API_BASE_URL}/wishlist/${wishlistId}`, {
                withCredentials: true,
            })

            if (data.resultCode === '200') {
                alert('위시리스트에서 삭제되었습니다.')
                await fetchWishList(userData.id)
            } else {
                alert(`삭제 실패: ${data.msg}`)
            }
        } catch (error) {
            console.error('위시리스트 삭제 실패:', error)
            alert('삭제 중 오류가 발생했습니다.')
        }
    }

    // =============== 장바구니 ===============
    const handleUpdateCart = async (cartId: number, quantity: number) => {
        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/cart/${cartId}?quantity=${quantity}`,
                {},
                { withCredentials: true }
            )

            console.log('수량 수정 성공:', data)

            setCart((prev) =>
                prev.map((item) =>
                    item.cartId === cartId ? { ...item, quantity: data.data.quantity } : item
                )
            )
        } catch (error) {
            console.error('장바구니 수량 수정 실패:', error)
            alert('수량 수정에 실패했습니다.')
        }
    }

    const handleDeleteCart = async (cartId: number) => {
        try {
            const { data } = await axios.delete(`${API_BASE_URL}/cart/${cartId}`, { withCredentials: true, })

            console.log('삭제 성공:', data)

            setCart((prev) => prev.filter((item) => item.cartId !== cartId))
        } catch (error) {
            console.error('장바구니 삭제 실패:', error)
            alert('삭제에 실패했습니다.')
        }
    }

    // =============== UI ===============
    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName)
        setEditMode({})
        setTempData({ ...userData })
    }

    const handleStatusClick = (status: string) => {
        setSelectedStatus(status)
        setIsStatusModal(true)
    }

    // =============== 렌더링 조건 ===============
    if (loading) {
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
            {/* 왼쪽 사이드바 */}
            <div className="mypage-sidebar">
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
                <a href="#" className='link-btn'>공방 페이지로 이동</a>
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
                                    <td>{stats.totalQna}</td>
                                    <td>{stats.totalReviews}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 주문배송조회 */}
                    {activeTab === 'orders' && (
                        <div className="tab-content">

                            {/* ================= 배송 상태 요약 ================= */}
                            <div className="delivery-status-summary">
                            {['배송준비중', '배송중', '배송완료'].map((status) => (
                                <div
                                key={status}
                                className="status-card"
                                onClick={() => {
                                    handleStatusClick(status)
                                    setIsStatusModal(true)
                                }}
                                >
                                <p>{status}</p>
                                <p>{orders.filter((o) =>
                                    o.deliveryStatus?.replace(/\s/g, '') === status.replace(/\s/g, '')
                                ).length}</p>
                                </div>
                            ))}
                            </div>

                            {/* ================= 주문 내역 ================= */}
                            <div className="section-header">
                            <h2>주문 내역</h2>
                            </div>

                            {orders.length === 0 ? (
                            <p>주문 내역이 없습니다.</p>
                            ) : (
                            orders.map((order) => (
                                <div
                                key={order.orderId}
                                className="order-card"
                                >
                                {/* 주문 요약 (클릭해서 아코디언 열기) */}
                                <div
                                    className="order-header"
                                    onClick={() => toggleOrder(order.orderId)}
                                >
                                    <div className='order-title'>
                                        <p>주문 일자: {order.createdDate} | 주문번호: {order.orderCode}</p>
                                        <span className={`badge ${order.deliveryStatus}`}>{order.deliveryStatus}</span>
                                    </div>
                                    <div className='order-img'>
                                        {(order.items || []).slice(0, 4).map((item, idx) => (
                                            <img
                                                key={idx}
                                                src={item.imageUrl}
                                                alt={item.productName}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* 아코디언 상세 영역 */}
                                {openOrderId === order.orderId && (
                                    <div className="order-accordion">

                                        {/* 상품 내역 */}
                                    <h3>상품 내역</h3>
                                    {(order.items || []).map((item, idx) => (
                                        <div key={`${item.orderItemId}-${idx}`} className="order-item">
                                            {/* 상품 이미지 */}
                                            {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className="order-item-img"
                                            />
                                            )}
                                            <div className="order-item-text">
                                            <p className="order-item-name">{item.productName}</p>
                                            <p className="order-item-detail">{item.price?.toLocaleString()}원 / {item.quantity}개</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* 주문 상세 정보 */}
                                    <div className="order-info">
                                        <p>주문일자: {order.createdDate}</p>
                                        <p>주문번호: {order.orderCode}</p>
                                        <p>배송상태: {order.deliveryStatus}</p>

                                        {order.deliveries?.length > 0 && (() => {
                                        const d = order.deliveries[0]
                                        return (
                                            <>
                                            <p>운송장번호: {d.trackingNumber || '없음'}</p>
                                            <p>수령인: {d.recipientName || '정보 없음'}</p>
                                            <p>주소: {d.baseAddress || ''} {d.detailAddress || ''}</p>
                                            <p>우편번호: {d.zipcode || ''}</p>
                                            </>
                                        )
                                        })()}

                                        {order.deliveryStatus === '배송완료' && order.completedAt && (
                                        <p>배송완료일: {new Date(order.completedAt).toLocaleDateString('ko-KR')}</p>
                                        )}
                                    </div>

                                    {/* 버튼 영역 */}
                                    <div className="order-actions" style={{ marginTop: 15 }}>
                                        {order.deliveryStatus === "배송준비중" && (
                                        <button
                                            className="btn-primary"
                                            onClick={(e) => {
                                            e.stopPropagation()
                                            handleCancelOrder(order.orderId, "주문취소")
                                            }}
                                        >
                                            주문 취소
                                        </button>
                                        )}

                                        {order.deliveryStatus === "배송완료" &&
                                        isWithinSevenDays(order.completedAt) && (
                                            <>
                                            <button
                                                className="btn-primary"
                                                onClick={(e) => {
                                                e.stopPropagation()
                                                handleReturnOrder(order.orderId, "반품")
                                                }}
                                            >
                                                반품 신청
                                            </button>

                                            <button
                                                className="btn-primary"
                                                onClick={(e) => {
                                                e.stopPropagation()
                                                handleExchangeOrder(order.orderId, "교환")
                                                }}
                                            >
                                                교환 신청
                                            </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="order-actions" style={{ marginTop: 15 }}>
                                        <button
                                            className="link-btn delete"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteOrder(order.orderId)
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </div>

                                    {/* 아코디언 하단 금액 */}
                                    <div className="order-footer">
                                        <p>총 결제금액: {order.totalPrice?.toLocaleString()}원</p>
                                    </div>
                                    </div>
                                )}
                                </div>
                            ))
                            )}
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
                                    <option value="전체">전체</option>
                                    <option value="취소">취소</option>
                                    <option value="반품">반품</option>
                                    <option value="교환">교환</option>
                                </select>
                            </div>

                            <div className="orders-list">
                                {filteredOrders.length === 0 ? (
                                    <p>해당 주문 내역이 없습니다.</p>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const items = order.orderItems || []

                                        // 최신 배송 상태
                                        const latestDelivery = order.deliveries
                                            ?.slice()
                                            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))[0]

                                        const status = latestDelivery?.deliveryStatus || order.deliveryStatus

                                        return (
                                            <div key={order.orderId} className="order-card">

                                                {/* --- 주문 요약 (아코디언 열기) --- */}
                                                <div
                                                    className="order-header"
                                                    onClick={() => toggleManageOrder(order.orderId)}
                                                >
                                                    <p>주문번호: {order.orderCode}</p>
                                                    <p>주문일: {order.createdDate}</p>
                                                    <span className={`badge ${status}`}>{status}</span>
                                                </div>

                                                {/* --- 아코디언 상세 영역 --- */}
                                                {openedOrderId === order.orderId && (
                                                    <div className="order-accordion">

                                                        <h3>상품 내역</h3>
                                                        {items.map((item) => (
                                                            <div key={item.orderItemId} className="order-item">
                                                                <div className="order-item-text">
                                                                    <p className="order-item-name">{item.productName}</p>
                                                                    <p className="order-item-detail">
                                                                        {item.price?.toLocaleString()}원 / {item.quantity}개
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* 주문 상세 정보 */}
                                                        <div className="order-info">
                                                            <p>주문일자: {order.createdDate}</p>
                                                            <p>주문번호: {order.orderCode}</p>
                                                            <p>배송상태: {status}</p>
                                                            <p>사유: {order.cancelReason}{order.exchangeReason}{order.returnReason}</p>
                                                        </div>

                                                        {/* 삭제 버튼만 표시 */}
                                                        <div className="order-actions">
                                                            <button
                                                                className="link-btn delete"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleDeleteOrder(order.orderId)
                                                                }}
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>

                                                        <div className="order-footer">
                                                            <p>총 결제금액: {order.totalPrice?.toLocaleString()}원</p>
                                                        </div>

                                                    </div>
                                                )}
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
                                    <div className="empty-state">장바구니에 담은 상품이 없습니다.</div>
                            ) : (
                                <div className="cart-list">
                                    {cart.map((item) => (
                                        <div key={item.cartId} className="cart-product">
                                            <div className="cart-image"></div>
                                            <div className='cart-text'>
                                                <Link href={`http://localhost:3000/product/list/detail/${item.productId}`} className="product-name">
                                                    {item.productName}
                                                </Link>
                                                <p>{item.price ? `${item.price * item.quantity}원` : '가격 정보 없음'}</p>
                                            </div>
                                            <div className="quantity-control">
                                                <button className="btn-primary"
                                                    onClick={() => handleUpdateCart(item.cartId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span>{item.quantity}개</span>
                                                <button className="btn-primary"
                                                    onClick={() => handleUpdateCart(item.cartId, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                                <button className="link-btn delete" onClick={() => handleDeleteCart(item.cartId)}>삭제</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {/* 장바구니 담기 버튼 */}
                    {/* <button onClick={() => handleAddToCart(item.productId, 1)}>
                        장바구니 담기
                    </button> */}

                    {/* 회원정보수정 */}
                    {activeTab === 'profile' && (
                        <div className="tab-content">
                            {!isAuthenticated ? (
                                <div className="auth-banner">
                                    <span>정보 수정을 위해 비밀번호 인증이 필요합니다</span>
                                    <div className='auth-banner-input'>
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
                                            {errors.nickName && <p className="error-msg">{errors.nickName}</p>}
                                        </div>
                                    ) : (
                                        <p>{userData.nickName}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>비밀번호</label>
                                    {editMode.profile ? (
                                        <div className='profile-input'>
                                            <input
                                                type="password"
                                                placeholder="새 비밀번호 입력"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="editable"
                                            />
                                            {errors.newPassword && <p className="error-msg">{errors.newPassword}</p>}
                                        </div>
                                    ) : (
                                        <p>********</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>비밀번호 확인</label>
                                    {editMode.profile && (
                                        <div className='profile-input'>
                                            <input
                                                type="password"
                                                placeholder="비밀번호 재입력"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
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
                                            {errors.email && <p className="error-msg">{errors.email}</p>}
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
                                            {errors.mobilePhone && <p className="error-msg">{errors.mobilePhone}</p>}
                                        </div>
                                    ) : (
                                        <p>{userData.mobilePhone}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>생년월일</label>
                                    <p>{userData.birth}</p>
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
                                    {wishList.length === 0 ? (
                                        <div className="empty-state">좋아요한 상품이 없습니다.</div>
                                    ) : (
                                        <div className="wishlist-grid">
                                            {wishList.map((item) => (
                                                <div key={item.wishlistId} className="wishlist-item">
                                                    <div className="wishlist-image"></div>
                                                    <div className="wishlist-info">
                                                        <p>{item.productName}</p>
                                                        <p className="price">{item.price ? `${item.price}원` : '가격 정보 없음'}</p>
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
                                <div className="subtab-content">
                                    {followList.length === 0 ? (
                                        <div className="empty-state">팔로우한 작가가 없습니다.</div>
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
                                                <Link href={`http://localhost:3000/product/list/detail/${review.productId}`} className="my-review-product-name">
                                                    {review.productName}
                                                </Link>
                                                <span className="my-review-rating">⭐ {review.rating} / 5</span>
                                            </div>

                                            <div className="my-review-images">
                                                {review.images?.map((imgUrl, idx) => (
                                                    <img key={idx} src={imgUrl} alt={`리뷰 이미지 ${idx + 1}`} />
                                                ))}
                                                {/* <p>⭐TODO: 이미지 꼭 확인해볼 것⭐</p> */}
                                            </div>

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
                                                    onClick={() => handleDeleteClick(review)}
                                                    className="link-btn delete"
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
                                        <div
                                            key={item.qnaId}
                                            className="qna-card"
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

                                            <div className="qna-footer">
                                                <span>
                                                    작성일:{' '}
                                                    {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    })}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation() // 카드 클릭 이벤트 막기
                                                        handleDeleteClick(item)
                                                    }}
                                                    className="link-btn delete"
                                                >
                                                    삭제
                                                </button>
                                            </div>

                                            {/* ▼▼▼ 클릭 시 열리는 답변 영역 ▼▼▼ */}
                                            {openQnaId === item.qnaId && (
                                                <div className="qna-answer">
                                                    <h4>답변 내용</h4>
                                                    <p>{item.answer || '아직 답변이 등록되지 않았습니다.'}</p>
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

            {/* 배송 상태별 주문 모달 */}
            {isStatusModal && (
                <div className="orders-modal" onClick={() => setIsStatusModal(false)}>
                    <div className="orders-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="orders-modal-close" onClick={() => setIsStatusModal(false)}>
                            &times
                        </button>
                        <h2>{selectedStatus}</h2>

                        {orders.filter(o =>
                            o.deliveryStatus === selectedStatus &&
                            (selectedStatus !== '배송완료' || isWithinSevenDays(o.completedAt))
                            ).length === 0 ? (
                            <p>주문 내역이 없습니다.</p>
                        ) : (
                            orders
                            .filter(o =>
                                o.deliveryStatus === selectedStatus &&
                                (selectedStatus !== '배송완료' || isWithinSevenDays(o.completedAt))
                            )
                            .map((order) => (
                                <div key={order.orderId} className="order-card">
                                <div className="order-header">
                                    <p>{order.createdDate} | 주문번호: {order.orderCode}</p>
                                    <span>{order.deliveryStatus}</span>
                                </div>
                                <div className="order-footer">
                                    <p>총 {order.totalPrice?.toLocaleString()}원</p>
                                </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 배송지 추가 모달 */}
            {isAddressModal && (
                <div className="address-modal" onClick={() => setIsAddressModal(false)}>
                    <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="address-modal-close" onClick={() => setIsAddressModal(false)}>
                            &times
                        </button>

                        <h2 style={{ marginBottom: '10px' }}>새 배송지 추가</h2>
                        <input
                            type="text"
                            placeholder="수령인 이름"
                            value={newAddress.recipientName}
                            onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                        />
                        <br />

                        <input
                            type="text"
                            id="sample6_postcode"
                            placeholder="우편번호"
                            value={newAddress.zipcode}
                            readOnly
                        />
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
                            onChange={(e) => setNewAddress({ ...newAddress, detailAddress: e.target.value })}
                        />
                        <br />
                        <label>
                            <input
                                type="checkbox"
                                checked={newAddress.isDefault}
                                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
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

            {/* 배송지 수정 모달 */}
            {editAddressModal && editAddressData && (
                <div className="address-modal" onClick={() => setEditAddressModal(false)}>
                    <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="address-modal-close" onClick={() => setEditAddressModal(false)}>
                            &times
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
                        <input type="text" placeholder="우편번호" value={editAddressData.zipcode} readOnly />
                        <input type="text" placeholder="주소" value={editAddressData.baseAddress} readOnly />
                        <input
                            type="text"
                            placeholder="참고항목"
                            value={editAddressData.extraAddress}
                            onChange={(e) => setEditAddressData({ ...editAddressData, extraAddress: e.target.value })}
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

            {/* 결제수단 추가 모달 */}
            {isPaymentModal && (
                <div className="payment-modal" onClick={() => setIsPaymentModal(false)}>
                    <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="payment-modal-close" onClick={() => setIsPaymentModal(false)}>
                            &times
                        </button>

                        <h2>새 결제수단 추가</h2>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()
                                await handleSavePayment()
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label>결제수단 종류</label>
                                <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                                    <option value="BANK">은행 계좌</option>
                                    <option value="CARD">신용/체크카드</option>
                                </select>
                            </div>

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

                            <div>
                                <input
                                    type="checkbox"
                                    checked={defaultPayment}
                                    onChange={(e) => setDefaultPayment(e.target.checked)}
                                />
                                <span>기본 결제수단으로 설정</span>
                            </div>

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

            {/* 리뷰 수정 모달 */}
            {isEditReviewModal && (
                <div className="review-modal" onClick={() => setIsEditReviewModal(false)}>
                    <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="review-modal-close" onClick={() => setIsEditReviewModal(false)}>
                            &times
                        </button>

                        <h2>리뷰 수정</h2>

                        <label>별점:</label>
                        <select
                            value={editReviewRating}
                            onChange={(e) => setEditReviewRating(Number(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select><br />

                        <label>리뷰 내용:</label>
                        <textarea
                            value={editReviewContent}
                            onChange={(e) => setEditReviewContent(e.target.value)}
                        /> <br />

                        <button className="btn-primary" onClick={handleSaveEdit}>
                            저장
                        </button>
                    </div>
                </div>
            )}

            {/* 리뷰 삭제 모달 */}
            {isDeleteReviewModal && (
                <div className="review-modal" onClick={() => setIsDeleteReviewModal(false)}>
                    <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="review-modal-close" onClick={() => setIsDeleteReviewModal(false)}>
                            &times
                        </button>

                        <h2>리뷰 삭제</h2>
                        <p>정말로 이 리뷰를 삭제하시겠습니까?</p>

                        <button className="btn-primary" onClick={handleDeleteReview}>
                            삭제
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
