"use client"

import { useState, useEffect } from 'react'
import axios from 'axios'
import api from '@/app/utils/api'

const API_BASE_URL = `${api.defaults.baseURL}`

export const useWishlist = (
  onWishCountChange?: (count: number) => void,
  onFollowCountChange?: (count: number) => void
) => {

  const [infiniteWishList, setInfiniteWishList] = useState<any[]>([])
  const [infiniteWishLoading, setInfiniteWishLoading] = useState(false)
  const [infiniteWishHasMore, setInfiniteWishHasMore] = useState(true)
  const [infiniteWishLastId, setInfiniteWishLastId] = useState<number | null>(null)

  const [followList, setFollowList] = useState<any[]>([])
  const [activeSubTab, setActiveSubTab] = useState('product')

  const [recommendItems, setRecommendItems] = useState<any[]>([])
  const [recommendMessage, setRecommendMessage] = useState("")

  const SIZE = 10

  // ================= 무한스크롤 =================
  const fetchInfiniteWishList = async (lastId: number | null) => {
    if (infiniteWishLoading) return
    if (!infiniteWishHasMore && lastId !== null) return

    setInfiniteWishLoading(true)

    try {
      const res = await axios.get(
        `${API_BASE_URL}/mypage/wishlist/infinite`,
        {
          params: { lastWishId: lastId, size: SIZE },
          withCredentials: true
        }
      )

      const newItems = res.data.data || []

      setInfiniteWishList(prev => {
        const merged = [...prev, ...newItems]
        const unique = merged.filter(
          (item, index, self) =>
            index === self.findIndex(t => t.wishlistId === item.wishlistId)
        )

        onWishCountChange?.(unique.length)
        return unique
      })

      if (newItems.length > 0) {
        setInfiniteWishLastId(newItems[newItems.length - 1].wishlistId)
      }

      setInfiniteWishHasMore(newItems.length === SIZE)
      
    } catch (e) {
      console.error("무한스크롤 위시 실패:", e)
    } finally {
      setInfiniteWishLoading(false)
    }
  }

  // ================= 초기화 =================
  const resetInfiniteWishList = () => {
    setInfiniteWishList([])
    setInfiniteWishHasMore(true)
    setInfiniteWishLastId(null)
  }

  // ================= 팔로우 =================
  const fetchFollowList = async (userId?: number) => {
    if (!userId) return

    try {
      const { data } = await axios.get(`${API_BASE_URL}/mypage/follow?userId=${userId}`, {
        withCredentials: true,
      })

      const list = Array.isArray(data.data) ? data.data : []
      setFollowList(list)

      onFollowCountChange?.(list.length)

    } catch (error) {
      console.error('팔로우 목록 조회 실패:', error)
      setFollowList([])
      onFollowCountChange?.(0)
    }
  }

  const handleUnfollow = async (studioId: number, userId: number) => {
    const confirmed = confirm('정말 이 공방을 언팔로우 하시겠습니까?')
    if (!confirmed) return

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/mypage/follow`, {
        params: { studioId },
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        setFollowList(prev =>
          prev.filter(item => item.studioId !== studioId)
        )
        alert('공방을 언팔로우 했습니다.')
      } else {
        alert(`언팔로우 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error('언팔로우 실패:', error)
      alert('언팔로우 중 오류가 발생했습니다.')
    }
  }

  // ================= 위시 리스트 삭제 =================
  const handleRemoveWish = async (wishlistId: number) => {
    const confirmed = confirm('정말 이 상품을 삭제 하시겠습니까?')
    if (!confirmed) return

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/mypage/wishlist/${wishlistId}`, {
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        const updated = infiniteWishList.filter(item => item.wishlistId !== wishlistId)
        setInfiniteWishList(updated)

        onWishCountChange?.(updated.length)

      } else {
        alert(`삭제 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error('위시리스트 삭제 실패:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // ================= AI 추천 =================
  const fetchRecommendList = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/mypage/recommend/wishlist`, {
        withCredentials: true,
      })

      const result = res.data?.data

      if (!result) {
        setRecommendItems([])
        setRecommendMessage("")
        return
      }

      if (res.data?.data) {
        setRecommendItems(res.data.data.items)
        setRecommendMessage(res.data.data.aiMessage)
      }

      setRecommendItems(result.items ?? [])
      setRecommendMessage(result.aiMessage ?? "")

    } catch (err) {
      console.error("AI 추천 조회 실패:", err)
      setRecommendItems([])
      setRecommendMessage("")
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

    recommendItems,
    recommendMessage,

    fetchInfiniteWishList,
    resetInfiniteWishList,

    fetchFollowList,
    handleUnfollow,
    handleRemoveWish,

    fetchRecommendList,
  }
}