'use client'

import axios from 'axios'
import { useState, useEffect } from 'react'
import '@/app/personal/page.css'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk"

const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

interface Post {
  id: number
  title: string
  content: string
  imageUrl?: string
}

interface Order {
  orderId: number
  orderCode: string
  createdDate: string
  deliveryStatus: string
  totalPrice: number
  completedAt?: string
  items?: any[]
  deliveries?: any[]
}

interface WishItem {
  wishlistId: number
  productName: string
  price: number
  imageUrl?: string
}

interface CartItem {
  cartId: number
  productName: string
  price: number
  quantity: number
  imageUrl?: string
  productId: number
}

export default function MyPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // =============== State 관리 ===============
    // 사용자 정보
    const [userData, setUserData] = useState<any>(null)
    const [tempData, setTempData] = useState<any>(null)
    const [stats, setStats] = useState<any>({
        totalQna: 0,
        totalReviews: 0,
    })
    const [errors, setErrors] = useState<any>({})

    // UI 상태
    const [pageLoading, setPageLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("orders")
    const [activeSubTab, setActiveSubTab] = useState('product')
    const [editMode, setEditMode] = useState({})

    //무한스크롤
    const [infiniteOrders, setInfiniteOrders] = useState<Order[]>([])
    const [infiniteOrdersLoading, setInfiniteOrdersLoading] = useState(false)
    const [infiniteOrdersHasMore, setInfiniteOrdersHasMore] = useState(true)
    const [infiniteOrdersLastId, setInfiniteOrdersLastId] = useState<number | null>(null)

    const [infiniteWishList, setInfiniteWishList] = useState<WishItem[]>([])
    const [infiniteWishLoading, setInfiniteWishLoading] = useState(false)
    const [infiniteWishHasMore, setInfiniteWishHasMore] = useState(true)
    const [infiniteWishLastId, setInfiniteWishLastId] = useState<number | null>(null)

    const [infiniteCart, setInfiniteCart] = useState<CartItem[]>([])
    const [infiniteCartLoading, setInfiniteCartLoading] = useState(false)
    const [infiniteCartHasMore, setInfiniteCartHasMore] = useState(true)
    const [infiniteCartLastId, setInfiniteCartLastId] = useState<number | null>(null)

    const SIZE = 10

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
    const [isReasonModal, setIsReasonModal] = useState(false)
    const [reasonModalTitle, setReasonModalTitle] = useState("")
    const [reasonModalOnSubmit, setReasonModalOnSubmit] = useState<(reason: string) => void>(() => {})
    const [reasonText, setReasonText] = useState("")

    // 배송지
    const [addresses, setAddresses] = useState<any[]>([])
    const [isAddressModal, setIsAddressModal] = useState(false)
    const [editAddressModal, setEditAddressModal] = useState(false)
    const [editAddressData, setEditAddressData] = useState<any>(null)
    const [defaultAddress, setDefaultAddress] = useState(false)
    const [newAddress, setNewAddress] = useState({
        recipientName: '',
        zipcode: '',
        baseAddress: '',
        detailAddress: '',
        extraAddress: '',
    })

    // 결제수단
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])
    const [isPaymentModal, setIsPaymentModal] = useState(false)
    const [paymentType, setPaymentType] = useState<"CARD" | "BANK">("BANK")
    const [bankName, setBankName] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [accountHolder, setAccountHolder] = useState("")
    const [cardCompany, setCardCompany] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [cardExpire, setCardExpire] = useState("")
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
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    //문의
    const [qna, setQna] = useState<any[]>([])
    const [openQnaId, setOpenQnaId] = useState(null)

    //이미지
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(stats.profileImageUrl)
    const [profileFile, setProfileFile] = useState<File | null>(null)

    //결제
    const [orderCode, setOrderCode] = useState<string | null>(null)
    const [total, setTotal] = useState<number>(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [paymentWidget, setPaymentWidget] = useState<any>(null)
    const [widgetLoaded, setWidgetLoaded] = useState(false)
    const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
    const customerKey = 'lMWxsh58-vF7S1kAyBIuG'
    
    // =============== Effects ===============
    useEffect(() => {
        const init = async () => {
            setPageLoading(true)
            try {
                const user = await fetchUser()
                if (!user || !user.id) return

                await loadAllData(user.id)
            } catch (error) {
                console.error('초기 데이터 로딩 실패:', error)
            } finally {
                setPageLoading(false)
            }
        }

        init()
    }, [])

    useEffect(() => {
        if (isAddressModal && !window.daum) {
            const script = document.createElement('script')
            script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
            script.async = true
            document.body.appendChild(script)
        }
    }, [isAddressModal])

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab) setActiveTab(tab)
    }, [searchParams])

    // =============== API 호출 함수 ===============
    const loadAllData = async (userId: number) => {
        try {
            await Promise.all([
                fetchOrders(userId),
                fetchAddresses(userId),
                fetchPaymentMethods(),
                fetchWishList(userId),
                fetchFollowList(userId),
                fetchStatsData(userId),
                fetchMyReviews(userId),
                fetchCart(userId),
                fetchQna(userId),
                fetchProfileImage(userId),
            ])
        } catch (error) {
            console.error('데이터 로드 실패:', error)
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

    const fetchOrders = async (id?: number) => {
        if (!id) return

        try {
            const { data } = await axios.get(`${API_BASE_URL}/orders`, {
                params: { lastOrderId: infiniteOrdersLastId, size: SIZE },
                withCredentials: true,
            })
            
            if (data.resultCode === '200') {
                const orderList = data.data || []
                setOrders(Array.isArray(orderList) ? orderList : [])
            } else {
                console.warn('주문 조회 실패:', data.msg)
                alert(data.msg || '주문 내역을 불러오는데 실패했습니다.')
                setOrders([])
            }
        } catch (error) {
            console.error('주문 내역 조회 실패:', error)
            setOrders([])
        }
    }

    const fetchCart = async (id?: number) => {
        if (!id) return

        try {
            const { data } = await axios.get(`${API_BASE_URL}/cart`, {
                withCredentials: true,
            })

            const list = Array.isArray(data.data) ? data.data : []

            // 기존 cart 저장
            setCart(list)

            // 화면 렌더링용 infiniteCart에도 저장
            setInfiniteCart(list)
            setInfiniteCartLastId(list.length ? list[list.length - 1].cartId : null)
            setInfiniteCartHasMore(false) // 장바구니는 일반적으로 페이징 안함

        } catch (error) {
            console.error('장바구니 목록 조회 실패:', error)
            setCart([])
            setInfiniteCart([])
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

    const fetchPaymentMethods = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/payment-methods`, {
                withCredentials: true,
            })

            if (data.resultCode === '200') {
                setPaymentMethods(data.data)
            } else {
                alert(`결제수단 조회 실패: ${data.msg}`)
            }
        } catch (error: any) {
            console.error('결제수단 조회 실패:', error)
            alert(error?.response?.data?.msg ?? '결제수단 조회 중 오류가 발생했습니다.')
        }
    }

    const fetchWishList = async (id?: number) => {
        if (!id) return
        try {
            const { data } = await axios.get(`${API_BASE_URL}/wishlist`, { withCredentials: true })

            const list = Array.isArray(data.data) ? data.data : []

            setWishList(list)             // 기존 state
            setInfiniteWishList(list)     // 화면 렌더링용
            setInfiniteWishLastId(list.length ? list[list.length - 1].wishlistId : null)
            setInfiniteWishHasMore(false) // 기본적으로 페이지가 없다고 처리

        } catch (error) {
            console.error('위시 목록 조회 실패:', error)
            setWishList([])
            setInfiniteWishList([])
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
            setStats({
                totalQna: data.totalQna ?? 0,
                totalReviews: data.totalReviews ?? 0,
            })
        } catch (error) {
            console.error('통계 조회 실패:', error)
            setStats({ totalQna: 0, totalReviews: 0 })
        }
    }

    const fetchMyReviews = async (id?: number) => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/reviews`, { withCredentials: true })
            const list = data.data || []
            setMyReviews(list)
            setStats((prev) => ({
                ...prev,
                totalReviews: list.length,
            }))
        } catch (error) {
            console.error('리뷰 조회 실패:', error)
            setStats([])
        }
    }

    const fetchQna = async (id?: number) => {
        const userId = id || userData?.id
        if (!userId) return
        
        try {
            const response = await axios.get(`${API_BASE_URL}/qna`, {
                params: { userId },
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
        }
    }

    const fetchProfileImage = async (id?: number) => {
        const userId = id || userData?.id
        if (!userId) return
        
        try {
            const response = await axios.get(`http://localhost:8090/api/v1/image/profile/${userId}`, {
            responseType: 'blob',
            withCredentials: true,
            })
            const blob = new Blob([response.data], { type: response.headers['content-type'] })
            const url = URL.createObjectURL(blob)
            setPreviewProfileImage(url)
            setStats(prev => ({ ...prev, profileImageUrl: url }))
        } catch (err) {
            console.error(err)
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

    // =============== 프로필 이미지 ===============
    const handleProfileClick = () => {
        setPreviewProfileImage(stats.profileImageUrl)
        setIsProfileModalOpen(true)
    }

    const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setProfileFile(file)
        setPreviewProfileImage(URL.createObjectURL(file))
    }

    const handleProfileUpload = async () => {
        if (!profileFile) return alert('이미지를 선택해주세요.')

        const formData = new FormData()
        formData.append('file', profileFile)

        try {
            const { data } = await axios.patch(
                `http://localhost:8090/api/v1/image/profile`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                }
            )

            if (data.resultCode === '200') {
                alert('프로필 이미지가 업데이트되었습니다.')
                setIsProfileModalOpen(false)
                setProfileFile(null)

                // 서버에서 받은 새 URL
                let uploadedUrl = `http://localhost:8090${data.data}`
                // 캐시 무효화
                uploadedUrl = `${uploadedUrl}?t=${Date.now()}`

                // preview 초기화
                setPreviewProfileImage(null)

                // stats 갱신 (즉시 렌더링 반영)
                setStats(prev => ({
                    ...prev,
                    profileImageUrl: uploadedUrl,
                }))

            } else {
                alert('업로드 실패')
            }
        } catch (error) {
            console.error(error)
            alert('업로드 중 오류가 발생했습니다.')
        }
    }

    const handleProfileDelete = async () => {
        if (!confirm('프로필 이미지를 삭제하시겠습니까?')) return

        try {
            const { data } = await axios.delete(`http://localhost:8090/api/v1/image/profile`, {
                withCredentials: true,
            })

            if (data.resultCode === 'S-3' || data.resultCode === '200') {
                alert('삭제 성공')
                setPreviewProfileImage(null)
                setProfileFile(null)
                setStats(prev => ({ ...prev, profileImageUrl: null }))
                setIsProfileModalOpen(false)
            } else {
                alert('삭제 실패')
            }
        } catch (error) {
            console.error(error)
            alert('삭제 중 오류가 발생했습니다.')
        }
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

    // ================= 주문 취소 / 반품 / 교환 =================
    const filteredOrders = orders.filter((order) => {
        if (activeFilter === "전체") return ["취소", "반품", "교환"].includes(order.deliveryStatus)
        if (activeFilter === "취소") return order.deliveryStatus === "취소"
        if (activeFilter === "반품") return order.deliveryStatus === "반품"
        if (activeFilter === "교환") return order.deliveryStatus === "교환"
        return true
    })

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

        const addressToSave = { ...newAddress, isDefault: defaultAddress }

        try {
            const { data } = await axios.post(`${API_BASE_URL}/addresses`, addressToSave, {
                withCredentials: true,
            })

            if (data.resultCode === '200') {
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

        const addressToSave = { ...editAddressData, isDefault: defaultAddress }

        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/addresses/${editAddressData.userAddressId}`,
                addressToSave,
                { withCredentials: true },
            )

            if (data.resultCode === '200') {
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

    const sample6_execDaumPostcodeForEdit = () => {
        new window.daum.Postcode({
            oncomplete: function (data: any) {
                setEditAddressData(prev => ({
                    ...prev,
                    zipcode: data.zonecode,
                    baseAddress: data.address,
                    extraAddress: data.buildingName || '',
                }))
            },
        }).open()
    }

    // =============== 결제수단 ===============
    const handleSavePayment = async () => {
        if (paymentType === 'BANK' && (!bankName || !accountNumber || !accountHolder)) {
            alert('은행명과 계좌번호를 입력해주세요.')
            return
        }

        if (paymentType === 'CARD' && (!cardCompany || !cardNumber || !cardExpire)) {
            alert('카드사와 카드번호를 입력해주세요.')
            return
        }

        const payload: any = {
            type: paymentType,
            defaultPayment,
        }

        if (paymentType === "BANK") {
            payload.bankName = bankName
            payload.accountNumber = accountNumber
            payload.accountHolder = accountHolder
        } else {
            payload.cardCompany = cardCompany
            payload.cardNumber = cardNumber
            payload.cardExpire = cardExpire
        }

        try {
            const { data } = await axios.post(`${API_BASE_URL}/payment-methods`, payload, { withCredentials: true })

            if (data.resultCode === '200') {
                alert('결제수단 등록 성공')
                fetchPaymentMethods()
                setIsPaymentModal(false)
                resetPaymentForm()
            } else {
                alert(`등록 실패: ${data.msg}`)
            }
        } catch (error: any) {
            console.error('결제수단 등록 실패:', error)
            alert(error?.response?.data?.msg ?? '결제수단 등록 중 오류가 발생했습니다.')
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
        } catch (error: any) {
            console.error('기본 결제수단 설정 실패:', error)
            alert(error?.response?.data?.msg ?? '기본 결제수단 설정 중 오류가 발생했습니다.')
        }
    }

    const handleDeletePayment = async (paymentId: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            await axios.delete(`${API_BASE_URL}/payment-methods/${paymentId}`, {
                withCredentials: true,
            })
            fetchPaymentMethods()
        } catch (error: any) {
            console.error('결제수단 삭제 실패:', error)
            alert(error?.response?.data?.msg ?? '삭제 중 오류가 발생했습니다.')
        }
    }

    const maskCard = (num: string | undefined) => {
        if (!num) return ""
        return num.replace(/\d(?=\d{4})/g, "*")
    }

    const validatePayment = () => {
        const newErrors: any = {}

        // 공통: BANK or CARD
        if (paymentType === "BANK") {
            if (!bankName.trim()) newErrors.bankName = "은행명을 입력해주세요."
            if (!accountNumber.trim()) {
                newErrors.accountNumber = "계좌번호를 입력해주세요."
            } else if (!/^[0-9]{6,20}$/.test(accountNumber)) {
                newErrors.accountNumber = "계좌번호는 숫자 6~20자리여야 합니다."
            }

            if (!accountHolder.trim()) newErrors.accountHolder = "예금주명을 입력해주세요."
        }

        if (paymentType === "CARD") {
            if (!cardCompany.trim()) newErrors.cardCompany = "카드사를 입력해주세요."

            if (!cardNumber.trim()) {
                newErrors.cardNumber = "카드번호를 입력해주세요."
            } else if (!/^[0-9]{14,16}$/.test(cardNumber.replace(/-/g, ""))) {
                newErrors.cardNumber = "카드번호는 숫자 14~16자리여야 합니다."
            }

            if (!cardExpire.trim()) {
                newErrors.cardExpire = "유효기간을 입력해주세요."
            } else if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardExpire)) {
                newErrors.cardExpire = "유효기간은 MM/YY 형식이어야 합니다."
            }
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0 // 에러 없으면 true
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

    // ================= Q&A 기능 =================
    // 문의 삭제
    const handleDeleteQna = async (qnaId: number) => {
        if (!confirm("정말 이 문의를 삭제하시겠습니까?")) return

        try {
            const { data } = await axios.delete(`${API_BASE_URL}/qna/${qnaId}`, {
                params: { userId: userData.id },
                withCredentials: true,
            })

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
                alert('공방을 언팔로우 했습니다.')
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

            const newQty = data.data.quantity

            setInfiniteCart(prev =>
                prev.map(item =>
                    item.cartId === cartId
                        ? { ...item, quantity: newQty }
                        : item
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

            setInfiniteCart(prev => prev.filter(item => item.cartId !== cartId))

            setSelectedItems(prev => prev.filter(id => id !== cartId))
        } catch (error) {
            console.error('장바구니 삭제 실패:', error)
            alert('삭제에 실패했습니다.')
        }
    }

    const handleSelectItem = (cartId: number, isChecked: boolean) => {
        setSelectedItems(prev => 
            isChecked ? [...prev, cartId] : prev.filter(id => id !== cartId)
        )
    }

    // 전체 상품 구매
    const handlePurchaseAll = () => {
        console.log("전체 상품 구매:", cart)
        // 전체 구매 프로세스 진행
    }

    // 전체 선택
    const handleToggleSelectAll = () => {
        if (selectedItems.length === cart.length) {
            setSelectedItems([]) // 전체 해제
        } else {
            setSelectedItems(cart.map(item => item.cartId)) // 전체 선택
        }
    }

    // 전체 선택 해제 버튼
    const handleClearSelection = () => {
        setSelectedItems([])
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

    // =============== 무한 스크롤 ===============
    const fetchInfiniteOrders = async (lastId: number | null) => {
        setInfiniteOrdersLoading(true)
        try {
            const res = await axios.get(`${API_BASE_URL}/orders/infinite`, {
                params: {
                    lastOrderId: lastId ?? Number.MAX_SAFE_INTEGER,
                    size: SIZE,
                },
                withCredentials: true,
            })
            
            const newOrders = res.data.data

            if (newOrders.length < SIZE) {
                setInfiniteOrdersHasMore(false)
            }

            setInfiniteOrders(prev => {
                const merged = [...prev, ...newOrders]
                const unique = merged.filter(
                    (item, index, self) =>
                        index === self.findIndex(t => t.orderId === item.orderId)
                )
                return unique
            })

            if (newOrders.length > 0) {
                setInfiniteOrdersLastId(newOrders[newOrders.length - 1].orderId)
            }
        } catch (error) {
            console.error('주문 로드 실패:', error)
        } finally {
            setInfiniteOrdersLoading(false)
        }
    }

    const resetInfiniteOrders = () => {
        setInfiniteOrders([])
        setInfiniteOrdersHasMore(true)
        setInfiniteOrdersLastId(null)
    }

    const fetchInfiniteWishList = async (lastId: number | null) => {
        setInfiniteWishLoading(true)
        try {
            const res = await axios.get(`${API_BASE_URL}/wishlist/infinite`, {
                params: {
                    lastWishlistId: lastId ?? Number.MAX_SAFE_INTEGER,
                    size: SIZE,
                },
                withCredentials: true,
            })
            
            const newWishList = res.data.data

            if (newWishList.length < SIZE) {
                setInfiniteWishHasMore(false)
            }

            setInfiniteWishList(prev => {
                const merged = [...prev, ...newWishList]
                const unique = merged.filter(
                    (item, index, self) =>
                        index === self.findIndex(t => t.wishlistId === item.wishlistId)
                )
                return unique
            })

            if (newWishList.length > 0) {
                setInfiniteWishLastId(newWishList[newWishList.length - 1].wishlistId)
            }
        } catch (error) {
            console.error('위시리스트 로드 실패:', error)
        } finally {
            setInfiniteWishLoading(false)
        }
    }

    const resetInfiniteWishList = () => {
        setInfiniteWishList([])
        setInfiniteWishHasMore(true)
        setInfiniteWishLastId(null)
    }

    const fetchInfiniteCart = async (lastId: number | null) => {
        setInfiniteCartLoading(true)
        try {
            const res = await axios.get(`${API_BASE_URL}/cart/infinite`, {
                params: {
                    lastCartId: lastId ?? Number.MAX_SAFE_INTEGER,
                    size: SIZE,
                },
                withCredentials: true,
            })
            
            const newCart = res.data.data

            if (newCart.length < SIZE) {
                setInfiniteCartHasMore(false)
            }

            setInfiniteCart(prev => {
                const merged = [...prev, ...newCart]
                const unique = merged.filter(
                    (item, index, self) =>
                        index === self.findIndex(t => t.cartId === item.cartId)
                )
                return unique
            })

            if (newCart.length > 0) {
                setInfiniteCartLastId(newCart[newCart.length - 1].cartId)
            }
        } catch (error) {
            console.error('장바구니 로드 실패:', error)
        } finally {
            setInfiniteCartLoading(false)
        }
    }

    const resetInfiniteCart = () => {
        setInfiniteCart([])
        setInfiniteCartHasMore(true)
        setInfiniteCartLastId(null)
    }

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const viewportHeight = window.innerHeight
            const fullHeight = document.documentElement.scrollHeight

            if (scrollTop + viewportHeight >= fullHeight - 50) {
                // 탭에 따라 다른 fetch 함수 실행
                if (activeTab === 'orders' && !infiniteOrdersLoading && infiniteOrdersHasMore) {
                    fetchInfiniteOrders(infiniteOrdersLastId)
                } else if (activeTab === 'like' && activeSubTab === 'product' && !infiniteWishLoading && infiniteWishHasMore) {
                    fetchInfiniteWishList(infiniteWishLastId)
                } else if (activeTab === 'cart' && !infiniteCartLoading && infiniteCartHasMore) {
                    fetchInfiniteCart(infiniteCartLastId)
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
        infiniteCartLoading,
        infiniteCartHasMore,
        infiniteCartLastId
    ])

    useEffect(() => {
        if (activeTab === 'orders' && infiniteOrders.length === 0) {
            resetInfiniteOrders()
            fetchInfiniteOrders(null)
        } else if (activeTab === 'like' && activeSubTab === 'product' && infiniteWishList.length === 0) {
            resetInfiniteWishList()
            fetchInfiniteWishList(null)
        } else if (activeTab === 'cart' && infiniteCart.length === 0) {
            resetInfiniteCart()
            fetchInfiniteCart(null)
        }
    }, [activeTab, activeSubTab])

    // =============== 결제 ===============
    //선택 상품 구매하기
    const handlePurchaseSelected = async () => {
        if (selectedItems.length === 0) {
            alert("선택된 상품이 없습니다.")
            return
        }

        // 선택된 cartId → productId + quantity 로 변환
        const selected = infiniteCart
            .filter(item => selectedItems.includes(item.cartId))
            .map(item => ({
                productId: item.productId,
                quantity: item.quantity,
            }))

        try {
            const res = await axios.post(
                "http://localhost:8090/api/v1/mypage/cart/prepare",
                { items: selected },
                { withCredentials: true }
            )

            const { orderCode, totalPrice } = res.data.data

            localStorage.setItem("ORDER_CART_IDS", JSON.stringify(selectedItems))
            localStorage.setItem("PAY_PENDING", "1")

            // 모달을 띄우기 전에 결제 정보 저장
            setOrderCode(orderCode)
            setTotal(totalPrice)
            setTimeout(() => setIsModalOpen(true), 0)  // 토스 결제 위젯 모달 열기

        } catch (e: any) {
            console.error("장바구니 결제 준비 실패:", e)

            const err = e?.response?.data

            if (e?.response?.status === 401) {
                alert("로그인이 필요합니다.")
                router.push("/auth/login")
                return
            }

            alert(err?.message || "장바구니 주문 준비 중 오류가 발생했습니다.")
        }
    }

    useEffect(() => {
        if (!isModalOpen) return
        handleInitPaymentWidget(total) // 토스 위젯 초기화
    }, [isModalOpen, total])

    //장바구니 상품 결제
    const handleRequestPayment = async () => {
        if (!paymentWidget) {
            console.warn("[PAY] paymentWidget 없음")
            return
        }

        if (!orderCode) {
            console.warn("[PAY] orderCode 없음")
            return
        }

        console.log("[PAY] requestPayment 시작", { orderCode, total })

        try {
            await paymentWidget.requestPayment({
                amount: total,
                orderId: orderCode, // 준비 API에서 받은 orderCode
                orderName: "장바구니 상품 결제",
                successUrl: `${window.location.origin}/pay/success`,
                failUrl: `${window.location.origin}/pay/fail`,
            })

            console.log("[PAY] requestPayment resolve - 이 다음은 보통 안 옴 (success로 리다이렉트됨)")

            // 🔹 여기서는 아무 것도 하지 마. 성공 처리는 success 페이지에서.

        } catch (e: any) {
            console.error("[PAY] requestPayment catch 발생", e)

            // 👇 이게 핵심: 여기 들어왔다는 건 "유저가 결제창에서 취소" 같은 케이스
            try {
                console.log("[PAY] cancel-before-payment API 호출 시작", orderCode)

                await axios.post(
                    "http://localhost:8090/api/v1/mypage/orders/cancel-before-payment",
                    { orderCode },
                    { withCredentials: true }
                )

                console.log("[PAY] cancel-before-payment API 호출 성공")

            } catch (cancelErr) {
                console.error("[PAY] cancel-before-payment API 호출 실패", cancelErr)
            }

            if (e?.code === "USER_CANCEL") {
                alert("결제가 취소되었습니다.")
            } else {
                alert("결제 요청 중 오류가 발생했습니다.")
            }
        }
    }

    // 결제 성공 후 후처리
    useEffect(() => {
        const payPending = localStorage.getItem("PAY_PENDING")
        if (!payPending) return

        // 성공 페이지를 거쳐 되돌아온 경우
        const cameFromSuccess = document.referrer.includes("/pay/success")

        if (cameFromSuccess) {
            console.log("결제 성공 후 MyPage 진입 — 후처리 시작")

            const stored = localStorage.getItem("ORDER_CART_IDS")
            if (stored) {
                const cartIds = JSON.parse(stored)

                axios.delete("http://localhost:8090/api/v1/mypage/cart/after-order", {
                    data: { cartIds },
                    withCredentials: true,
                }).then(() => {
                    console.log("장바구니 삭제 완료")
                    localStorage.removeItem("ORDER_CART_IDS")
                    fetchCart(userData?.id) // 장바구니 UI 즉시 갱신
                })
            }

            // 모달·결제 관련 상태 초기화
            setIsModalOpen(false)
            setPaymentWidget(null)
            setTotal(0)
            setOrderCode(null)
            setSelectedItems([])

            // 결제 플래그 제거
            localStorage.removeItem("PAY_PENDING")
        }
    }, [])

    //장바구니 위젯 초기화
    const handleInitPaymentWidget = async (amount: number) => {
        try {
            let widget = paymentWidget

            if (!widget) {
                widget = await loadPaymentWidget(clientKey, customerKey)
                setPaymentWidget(widget)
            }

            await widget.renderPaymentMethods("#payment-method", {
                value: amount,
            })

            await widget.renderAgreement("#agreement")

            setWidgetLoaded(true)
        } catch (e) {
            console.error("장바구니 위젯 초기화 실패", e)
            setWidgetLoaded(false)
        }
    }

    //취소 시 초기화
    const handleClosePaymentModal = () => {
        setIsModalOpen(false)
        setWidgetLoaded(false)
        setPaymentWidget(null)
        setOrderCode(null)
        setTotal(0)
        setSelectedItems([])  // 선택된 상품 초기화 (선택 구매한 경우)
    }

    // 선택된 목록에서 첫 번째 cartId
    const firstSelectedCartId = selectedItems[0]

    // 첫번째 상품 데이터
    const firstSelectedItem = infiniteCart.find(
        item => item.cartId === firstSelectedCartId
    )

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
                                    위시리스트
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
                                                        stats.profileImageUrl || `http://localhost:8090${stats.profileImageUrl}` // 서버 이미지
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
                                    <p>{infiniteOrders.filter((o) => 
                                        o.deliveryStatus?.replace(/\s/g, '') === '배송준비중'
                                    ).length}</p>
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
                                    <p>{infiniteOrders.filter((o) => 
                                        o.deliveryStatus?.replace(/\s/g, '') === '배송중'
                                    ).length}</p>
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
                                    <p>{infiniteOrders.filter((o) => 
                                        o.deliveryStatus?.replace(/\s/g, '') === '배송완료' &&
                                        isWithinSevenDays(o.completedAt)
                                    ).length}</p>
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
                                            </div>
                                            <div className='order-img'>
                                                {(order.items || []).slice(0, 4).map((item, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={`http://localhost:8090${item.imageUrl}`}
                                                        alt={item.productName}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {infiniteOrdersLoading && <p style={{ textAlign: 'center' }}>Loading...</p>}
                            {!infiniteOrdersHasMore && <p style={{ textAlign: 'center', color: '#999' }}>---</p>}
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

                                                {/* --- 주문 요약 --- */}
                                                <div
                                                    className="order-header"
                                                    onClick={() => router.push(`/personal/${order.orderId}`)}
                                                >
                                                    <div className='order-title'>
                                                        <p>주문번호: {order.orderCode}</p>
                                                        <p> | 주문일: {order.createdDate}</p>
                                                        <p> | {status} 일시: {statusDate}</p>
                                                    </div>
                                                    <span className={`badge ${status}`}>{status}</span>
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

                            {infiniteCart.length === 0 ? (
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
                                                    checked={selectedItems.length === infiniteCart.length && infiniteCart.length > 0}
                                                    onChange={handleToggleSelectAll}
                                                />
                                                전체 선택
                                            </label>
                                            {selectedItems.length > 0 && (
                                                <span className="selection-info">
                                                    <span className="selection-count">{selectedItems.length}</span>개 상품 선택됨
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
                                        {infiniteCart.map((item) => (
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
                                                        src={`http://localhost:8090${item.imageUrl}`}
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
                                                        onClick={() => handleDeleteCart(item.cartId)}
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
                                                {/* <span className="summary-label">상품 금액</span>
                                                <span className="summary-value">
                                                    {selectedItems.length === 0
                                                        ? 0
                                                        : infiniteCart
                                                            .filter(item => selectedItems.includes(item.cartId))
                                                            .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                                                            .toLocaleString()}원
                                                </span> */}
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
                                                        : infiniteCart
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
                            {infiniteCartLoading && <p style={{ textAlign: 'center' }}>Loading...</p>}
                            {!infiniteCartHasMore && infiniteCart.length > 0 && <p style={{ textAlign: 'center', color: '#999' }}>---</p>}
                        </div>
                    )}

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
                                            onKeyDown={(e) => {if (e.key === "Enter") handleVerifyPassword()}}
                                        />
                                        <div className='auth-banner-btn' onClick={handleVerifyPassword}>인증 확인</div>
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
                                        <button className="btn-primary" onClick={() => handleCancel('profile')}>
                                            취소
                                        </button>
                                    </div>
                                )}
                            </div>

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

                    {/* 위시리스트 */}
                    {activeTab === 'like' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>위시리스트</h2>
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
                                                            src={`http://localhost:8090${item.imageUrl}`}
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
                                    {!infiniteWishHasMore && infiniteWishList.length > 0 && <p style={{ textAlign: 'center', color: '#999' }}>---</p>}
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
                                                                src={`http://localhost:8090${follow.studioImageUrl}`}
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

                            {myReviews.length === 0 ? (
                                <div className="empty-state">작성한 리뷰가 없습니다.</div>
                            ) : (
                                <div className="my-review-list">
                                    {myReviews.map((review) => (
                                        <div key={review.reviewId} className="my-review-card">
                                            <div className="my-review-header">
                                                <Link href={`http://localhost:3000/product/list/detail?productId=${review.productId}`} className="my-review-product-name">
                                                    {review.productName}
                                                </Link>
                                                <span className="my-review-rating">⭐ {review.rating} / 5</span>
                                            </div>

                                            {review.images && review.images.length > 0 && (
                                                <div key={review.reviewId} className="my-review-images">
                                                    {review.images.map((url, i) => (
                                                        <img
                                                            key={i}
                                                            src={`http://localhost:8090${url}`}
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
                                        <div key={item.qnaId} className="qna-card"
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
                                                <span>작성일: {' '}
                                                    {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    })}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteQna(item.qnaId)
                                                    }}
                                                    className="link-btn delete"
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
                            {orders.filter(o =>
                                o.deliveryStatus === selectedStatus &&
                                (selectedStatus !== '배송완료' || isWithinSevenDays(o.completedAt))
                            ).length === 0 ? (
                                <p className='empty-state'>주문 내역이 없습니다.</p>
                            ) : (
                                <div className="modal-orders-list">
                                    {orders
                                        .filter(o =>
                                            o.deliveryStatus === selectedStatus &&
                                            (selectedStatus !== '배송완료' || isWithinSevenDays(o.completedAt))
                                        )
                                        .map((order) => (
                                            <div key={order.orderId} className="modal-order-card">
                                                <div className="modal-order-header">
                                                    <span className="order-date">{order.createdDate}</span>
                                                    <span className="order-code">주문번호: {order.orderCode}</span>
                                                </div>
                                                <div className="modal-order-info">
                                                    <span className="product-name">{order.items?.[0]?.productName || "상품 없음"}</span>
                                                    <span className={`status-badge ${order.deliveryStatus}`}>
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
                            <button className="btn-primary" onClick={handleSaveAddress}>
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
                                        {errors.bankName && <p className="error-msg">{errors.bankName}</p>}
                                    </div>
                                    <div className="form-field">
                                        <label>계좌번호</label>
                                        <input 
                                            type="text"
                                            placeholder="계좌번호를 입력하세요"
                                            value={accountNumber} 
                                            onChange={(e) => setAccountNumber(e.target.value)} 
                                        />
                                        {errors.accountNumber && <p className="error-msg">{errors.accountNumber}</p>}
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
                                        {errors.cardNumber && <p className="error-msg">{errors.cardNumber}</p>}
                                    </div>
                                    <div className="form-field">
                                        <label>유효기간</label>
                                        <input 
                                            type="text"
                                            placeholder="MM/YY"
                                            value={cardExpire} 
                                            onChange={(e) => setCardExpire(e.target.value)} 
                                        />
                                        {errors.cardExpire && <p className="error-msg">{errors.cardExpire}</p>}
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
                                onClick={() => {
                                    if (validatePayment()) {
                                        handleSavePayment()
                                    }
                                }}
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

            {/*  리뷰 삭제 모달  */}
            {isDeleteReviewModal && (
                <div className="modal-overlay" onClick={() => setIsDeleteReviewModal(false)}>
                    <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>리뷰 삭제</h2>
                            <button className="modal-close" onClick={() => setIsDeleteReviewModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-confirm-message">
                                <p>정말로 이 리뷰를 삭제하시겠습니까?</p>
                                <p className="modal-warning">삭제된 리뷰는 복구할 수 없습니다.</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseModal}>
                                취소
                            </button>
                            <button className="btn btn-danger" onClick={handleDeleteReview}>
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
                            <button className="btn btn-secondary" onClick={() => setIsReasonModal(false)}>
                                취소
                            </button>
                            <button
                                className="btn btn-primary"
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
                                                ? `http://localhost:8090${firstSelectedItem.imageUrl}`
                                                : "/default-product.png"
                                        }
                                        alt="장바구니 대표 이미지"
                                    />
                                </div>

                                {/* 텍스트 */}
                                <div className="summaryText">
                                    <div className="summaryTitle">
                                        장바구니 상품 {selectedItems.length}개
                                    </div>

                                    <div className="summaryDesc">
                                        여러 상품을 함께 결제합니다.
                                    </div>

                                    <div className="summaryRow">
                                        <span className="summaryLabel">총 상품 수</span>
                                        <span className="summaryValue">{selectedItems.length}개</span>
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
        </div>
    )
}
