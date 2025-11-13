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
        setMyReviews(data.data)
    }
    const fetchStats = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/stats?userId=${id}`, { withCredentials: true })
        setStats(data.data)
    }

    //공방 전체 리스트 fetch
    const fetchStudioList = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/personal/seller/studioList/${id}`, { withCredentials: true })
        setStudioList(data.data)
    }
    //공방 전체 리스트중 최초 등록 공방 fetch
    const fetchStudio = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/personal/seller/studio/${id}`, { withCredentials: true })
        //console.log('📌 fetchStudio 응답:', data.data)
        setStudio(data.data)
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

    const handleEdit = (section: string) => {
        if (!isAuthenticated) return alert('비밀번호 인증이 필요합니다.')
        setEditMode({ ...editMode, [section]: true })
        setTempData({ ...userData })
    }

    const handleSave = async (section: string) => {
        if (!userData?.id) return
        if (newPassword && newPassword !== confirmPassword) return alert('비밀번호 확인이 일치하지 않습니다.')

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
    }

    const handleCancel = (section: string) => {
        setEditMode({ ...editMode, [section]: false })
        setTempData({ ...userData })
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
            />
        </div>
    )
}
