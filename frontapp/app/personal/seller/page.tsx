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
    const [studio, setStudio] = useState<any[]>([])

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
        const { data } = await axios.get(`${API_BASE_URL}/mypagestats?userId=${id}`, { withCredentials: true })
        setStats(data.data)
    }

    //공방 전체 리스트 fetch
    const fetchStudioList = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/personal/seller/studioList/${id}`, { withCredentials: true })
        setStats(data.data)
    }
    //공방 전체 리스트중 최초 등록 공방 fetch
    const fetchStudio = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/personal/seller/studio/${id}`, { withCredentials: true })
        setStats(data.data)
    }

    // ======= UI 이벤트 =======
    const handleTabClick = (tab: string) => setActiveTab(tab)
    const handleSubTabClick = (sub: string) => setActiveSubTab(sub)

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
            />
        </div>
    )
}
