'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import './sellerPage.css'
import Sidebar from './components/sideBar'
import MainContent from './components/mainContent'

const API_BASE_URL = 'http://localhost:8090/api/v1'

export default function MyPage() {
    // ======= 상태 관리 =======
    // userData---> seller 데이터 대체
    const [userData, setUserData] = useState<any>(null)
    const [stats, setStats] = useState<any>({ totalQna: 0, totalReviews: 0 })
    const [activeTab, setActiveTab] = useState('profile')
    const [activeSubTab, setActiveSubTab] = useState('studio')
    const [loading, setLoading] = useState(true)

    // =========== 인증 & 회원정보 ============
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})
    const [tempData, setTempData] = useState<any>({})
    const [passwordInput, setPasswordInput] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // 탭별 데이터 상태
    const [orders, setOrders] = useState<any[]>([])
    const [cart, setCart] = useState<any[]>([])
    const [myReviews, setMyReviews] = useState<any[]>([])
    const [addresses, setAddresses] = useState<any[]>([])
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])
    const [wishList, setWishList] = useState<any[]>([])
    const [followList, setFollowList] = useState<any[]>([])
    const [qna, setQna] = useState<any[]>([])

    // seller&studio 데이터 상태
    const [studioList, setStudioList] = useState<any[]>([])
    const [studio, setStudio] = useState<any>(null)

    // 이미지저장을 위한 데이터 상태
    // 공방 관련 이미지 상태 (STUDIO_MAIN / STUDIO_LOGO / STUDIO 등 refType별)
    const [studioImages, setStudioImages] = useState({
        STUDIO_MAIN: null as File | null,
        STUDIO_LOGO: null as File | null,
        STUDIO: [] as File[],
    })

    // ======= 초기 로딩 =======
    useEffect(() => {
        const init = async () => {
            try {
                const user = await fetchUser()
                if (!user?.id) return
                await Promise.all([
                    fetchOrders(user.id),
                    fetchCart(user.id),
                    fetchAddresses(user.id),
                    fetchPaymentMethods(user.id),
                    fetchWishList(user.id),
                    fetchFollowList(user.id),
                    fetchQna(user.id),
                    fetchMyReviews(user.id),
                    fetchStats(user.id),
                    fetchStudioList(user.id),
                    fetchStudio(user.id),
                ])
            } catch (error) {
                console.error('초기 로딩 실패:', error)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    // ======= API 함수 =======
    const fetchUser = async () => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/me`, { withCredentials: true })
        setUserData(data.data)
        return data.data
    }
    const fetchOrders = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/orders`, { withCredentials: true })
        setOrders(data.data)
    }
    const fetchCart = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/cart`, { withCredentials: true })
        setCart(data.data)
    }
    const fetchAddresses = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/addresses?userId=${id}`, { withCredentials: true })
        setAddresses(data.data)
    }
    const fetchPaymentMethods = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/payment-methods`, { withCredentials: true })
        setPaymentMethods(data.data)
    }
    const fetchWishList = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/wishlist`, { withCredentials: true })
        setWishList(data.data)
    }
    const fetchFollowList = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/follow?userId=${id}`, { withCredentials: true })
        setFollowList(data.data)
    }
    const fetchQna = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/qna?userId=${id}`, { withCredentials: true })
        setQna(data.data)
    }
    const fetchMyReviews = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/reviews`, { withCredentials: true })
        setMyReviews(data.data.studioList)
    }
    const fetchStats = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/stats?userId=${id}`, { withCredentials: true })
        setStats(data.data)
    }

    //공방 전체 리스트 fetch
    const fetchStudioList = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/personal/seller/studioList/${id}`, { withCredentials: true })
        setStudioList(data.data.studioList)
    }
    //공방 전체 리스트중 최초 등록 공방 fetch
    const fetchStudio = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/personal/seller/studio/${id}`, { withCredentials: true })
        //console.log('📌 fetchStudio 응답:', data.data)
        setStudio(data.data.studio)
    }

    // =============== 🔐 회원정보 관련 함수 ===============
    const handleVerifyPassword = async () => {
        if (!passwordInput) return alert('비밀번호를 입력해주세요.')

        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/mypage/me/verify-password`,
                { userId: userData.id, password: passwordInput },
                { withCredentials: true },
            )
            if (data.resultCode === '200') {
                setIsAuthenticated(true)
                alert('비밀번호 인증 완료')
            } else alert('비밀번호가 올바르지 않습니다.')
        } catch (err) {
            console.error('인증 실패:', err)
            alert('인증 중 오류가 발생했습니다.')
        }
    }

    const handleAddressSearch = () => {
        if (typeof window === 'undefined' || !window.daum) {
            alert('주소 검색 기능을 사용할 수 없습니다. 페이지를 새로고침 해주세요.')
            return
        }
        new window.daum.Postcode({
            oncomplete: function (data: any) {
                // ✅ [수정 2] onChange 대신 setStudioInfo 직접 호출
                setTempData((prev) => ({
                    ...prev,
                    studioAddPostNumber: data.zonecode,
                    studioAddMain: data.roadAddress,
                    studioAddDetail: '',
                }))
            },
        }).open()
    }

    // =============== 🖼 공통 이미지 업로드 핸들러 ===============
    /**
     * refType: STUDIO_MAIN / STUDIO_LOGO / STUDIO 등
     * options.multiple: true이면 여러장, false면 단일
     * options.max: multiple일 때 최대 개수 (기본 5)
     */
    const handleStudioImageChange = (refType: 'STUDIO_MAIN' | 'STUDIO_LOGO' | 'STUDIO', files: File | File[]) => {
        setStudioImages((prev) => ({
            ...prev,
            [refType]: Array.isArray(files) ? files : files,
        }))
    }

    /**
     * refType + refId + 파일들을 FormData로 구성
     * - Image 엔티티: refType, refId, imageUrl, imageFileName, sortOrder
     */
    const buildStudioImageFormData = (studioId: number): FormData | null => {
        const form = new FormData()
        let hasFile = false

        // STUDIO_MAIN, STUDIO_LOGO: File
        // STUDIO: File[]
        if (studioImages.STUDIO_MAIN) {
            form.append('files', studioImages.STUDIO_MAIN)
            form.append('refType', 'STUDIO_MAIN')
            form.append('refId', String(studioId))
            form.append('sortOrder', '0')
            hasFile = true
        }

        if (studioImages.STUDIO_LOGO) {
            form.append('files', studioImages.STUDIO_LOGO)
            form.append('refType', 'STUDIO_LOGO')
            form.append('refId', String(studioId))
            form.append('sortOrder', '0')
            hasFile = true
        }

        if (studioImages.STUDIO.length > 0) {
            studioImages.STUDIO.forEach((f, idx) => {
                form.append('files', f)
                form.append('refType', 'STUDIO')
                form.append('refId', String(studioId))
                form.append('sortOrder', String(idx))
            })
            hasFile = true
        }

        return hasFile ? form : null
    }

    /**
     * 실제 이미지 업로드 요청
     * - 백엔드 컨트롤러 예시:
     *   POST /api/v1/images/upload
     */
    const uploadStudioImages = async (studioId: number) => {
        const form = buildStudioImageFormData(studioId)
        if (!form) {
            // 업로드할 이미지가 없는 경우
            return
        }

        await axios.post(`${API_BASE_URL}/images/upload`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
        })
    }

    const handleEdit = (section: string) => {
        if (!isAuthenticated) return alert('비밀번호 인증이 필요합니다.')
        setEditMode({ ...editMode, [section]: true })
        //setTempData({ ...userData, ...studio })
        if (section === 'profile') {
            setTempData({ ...userData })
        }
        if (section === 'studio') {
            setTempData({ ...studio })
        }
        if (section === 'studioDesc') {
            setTempData({ ...studio })
        }
        if (section === 'studioAdd') {
            setTempData({}) // 신규 입력은 완전 빈 값
            // 또는 기본값으로 초기화 가능
        }
    }

    const handleSave = async (section: string) => {
        if (!userData?.id) return
        //if (newPassword && newPassword !== confirmPassword) return alert('비밀번호 확인이 일치하지 않습니다.')
        if (newPassword && newPassword !== confirmPassword) {
            return alert('비밀번호 확인이 일치하지 않습니다.')
        }
        try {
            let response

            // 2️⃣ 프로필 저장
            if (section === 'profile') {
                response = await axios.patch(
                    `${API_BASE_URL}/mypage/me/${userData.id}`,
                    {
                        nickName: tempData.nickName,
                        email: tempData.email,
                        mobilePhone: tempData.mobilePhone,
                        ...(newPassword ? { password: newPassword } : {}),
                    },
                    { withCredentials: true },
                )

                if (response.data.resultCode === '200') {
                    setUserData(response.data.data)
                    alert('회원 정보가 수정되었습니다.')
                }
            }

            // 3️⃣ 공방정보 저장
            else if (section === 'studio' || section === 'studioDesc') {
                response = await axios.patch(
                    `${API_BASE_URL}/studio/${studio.studioId}`,
                    {
                        studioBusinessNumber: tempData.studioBusinessNumber,
                        categoryId: tempData.categoryId,
                        studioMobile: tempData.studioMobile,
                        studioOfficeTell: tempData.studioOfficeTell,
                        studioFax: tempData.studioFax,
                        studioEmail: tempData.studioEmail,
                        studioDescription: tempData.studioDescription,
                        studioName: tempData.studioName,
                        studioAddPostNumber: tempData.studioAddPostNumber,
                        studioAddMain: tempData.studioAddMain,
                        studioAddDetail: tempData.studioAddDetail,
                    },
                    { withCredentials: true },
                )

                if (response.data.resultCode === '200') {
                    setStudio(response.data.data)
                    setEditMode({ ...editMode, [section]: false })
                    alert('공방 정보가 수정되었습니다.')
                }
            }

            /*
                // 1️추후 Tabs 추가시 여기에 다른 섹션 저장 로직 추가 가능
                else if (section === 'address') {
                    response = await axios.patch(
                        `${API_BASE_URL}/mypage/address/${tempData.addressId}`,
                        {
                            post: tempData.post,
                            addr1: tempData.addr1,
                            addr2: tempData.addr2,
                            receiver: tempData.receiver,
                            receiverPhone: tempData.receiverPhone,
                        },
                        { withCredentials: true }
                    );

                    if (response.data.resultCode === '200') {
                        alert("배송지가 수정되었습니다.");
                    }
                }
                */

            /* 
            //기존코드
            try {
                const { data } = await axios.patch(
                    `${API_BASE_URL}/mypage/me/${userData.id}`,
                    {
                        nickName: tempData.nickName,
                        email: tempData.email,
                        mobilePhone: tempData.mobilePhone,
                        ...(newPassword ? { password: newPassword } : {}),
                    },
                    { withCredentials: true },
                )
                if (data.resultCode === '200') {
                    setUserData(data.data)
                    setEditMode({ ...editMode, [section]: false })
                    alert('정보 수정 완료')
                }
            } catch (e) {
                console.error('정보 수정 실패:', e)
                alert('수정 실패')
            }
            */
        } catch (err) {
            console.error('저장 실패:', err)
            alert('저장 중 오류가 발생했습니다.')
        }
    }

    const handleCancel = (section: string) => {
        setEditMode({ ...editMode, [section]: false })
        //setTempData({ ...userData, ...studio })
        if (section === 'profile') {
            setTempData({ ...userData })
        }
        if (section === 'studio') {
            setTempData({ ...studio })
        }
        if (section === 'studioDesc') {
            setTempData({ ...studio })
        }
    }

    const handleTempChange = (field: string, value: string) => {
        //setTempData((prev: any) => ({ ...prev, [field]: value }))
        if (field === 'passwordInput') {
            setPasswordInput(value)
        } else {
            setTempData((prev: any) => ({ ...prev, [field]: value }))
        }
    }

    /*
        const onTempChange = (field: string, value: string) => {
            if (field === 'passwordInput') setPasswordInput(value)
            else setTempData((prev: any) => ({ ...prev, [field]: value }))
        }
        */

    // ======= UI 이벤트 =======
    const handleTabClick = (tab: string) => setActiveTab(tab)
    const handleSubTabClick = (sub: string) => setActiveSubTab(sub)

    // =============== 렌더링 조건 ===============
    if (loading) return <div>로딩중...</div>
    if (!userData) return <div>로그인이 필요합니다.</div>

    return (
        <div className="mypage-container">
            <Sidebar
                userData={userData}
                activeTab={activeTab}
                onTabClick={handleTabClick}
                studioList={studioList}
                studio={studio}
            />
            <MainContent
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                onSubTabClick={handleSubTabClick}
                userData={userData}
                stats={stats}
                orders={orders}
                cart={cart}
                myReviews={myReviews}
                addresses={addresses}
                paymentMethods={paymentMethods}
                wishList={wishList}
                followList={followList}
                qna={qna}
                studioList={studioList}
                studio={studio}
                tempData={tempData}
                isAuthenticated={isAuthenticated}
                editMode={editMode}
                passwordInput={passwordInput}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                onVerifyPassword={handleVerifyPassword}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onTempChange={handleTempChange}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onAddressSearch={handleAddressSearch}
                studioImages={studioImages}
                onStudioImageChange={handleStudioImageChange}
                onStudioImagesUpload={uploadStudioImages}
            />
        </div>
    )
}
