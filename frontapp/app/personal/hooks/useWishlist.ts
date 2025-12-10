// app/personal/hooks/useWishlist.ts
import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

export const useWishlist = () => {
  const [infiniteWishList, setInfiniteWishList] = useState<any[]>([])
  const [infiniteWishLoading, setInfiniteWishLoading] = useState(false)
  const [infiniteWishHasMore, setInfiniteWishHasMore] = useState(true)
  const [infiniteWishLastId, setInfiniteWishLastId] = useState<number | null>(null)
  const [followList, setFollowList] = useState<any[]>([])
  const [activeSubTab, setActiveSubTab] = useState('product')

  const fetchInfiniteWishList = async (lastId: number | null) => {
    if (infiniteWishLoading) return
    if (!infiniteWishHasMore && lastId !== null) return

    setInfiniteWishLoading(true)

    try {
      const res = await axios.get(
        `${API_BASE_URL}/wishlist/infinite`,
        {
          params: { lastWishId: lastId, size: 10 },
          withCredentials: true
        }
      )

      const newItems = res.data.data || []
      setInfiniteWishList(prev => [...prev, ...newItems])

      if (newItems.length > 0) {
        setInfiniteWishLastId(newItems[newItems.length - 1].wishlistId)
      }

      setInfiniteWishHasMore(newItems.length === 10)
      
    } catch (e) {
      console.error("무한스크롤 위시 실패:", e)
    } finally {
      setInfiniteWishLoading(false)
    }
  }

  const resetInfiniteWishList = () => {
    setInfiniteWishList([])
    setInfiniteWishHasMore(true)
    setInfiniteWishLastId(null)
  }

  const fetchFollowList = async (userId?: number) => {
    if (!userId) return
    try {
      const { data } = await axios.get(`${API_BASE_URL}/follow?userId=${userId}`, {
        withCredentials: true,
      })
      setFollowList(Array.isArray(data.data) ? data.data : [])
    } catch (error) {
      console.error('팔로우 목록 조회 실패:', error)
      setFollowList([])
    }
  }

  const handleRemoveWish = async (wishlistId: number) => {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/wishlist/${wishlistId}`, {
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        setInfiniteWishList(prev => prev.filter(item => item.wishlistId !== wishlistId))
      } else {
        alert(`삭제 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error('위시리스트 삭제 실패:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleUnfollow = async (studioId: number, userId: number) => {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/follow`, {
        params: { studioId },
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        alert('공방을 언팔로우 했습니다.')
        await fetchFollowList(userId)
      } else {
        alert(`언팔로우 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error('언팔로우 실패:', error)
      alert('언팔로우 중 오류가 발생했습니다.')
    }
  }

  return {
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
  }
}