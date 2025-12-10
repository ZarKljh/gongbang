// app/personal/hooks/useOrders.ts
import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

export const useOrders = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [infiniteOrders, setInfiniteOrders] = useState<any[]>([])
  const [infiniteOrdersLoading, setInfiniteOrdersLoading] = useState(false)
  const [infiniteOrdersHasMore, setInfiniteOrdersHasMore] = useState(true)
  const [infiniteOrdersLastId, setInfiniteOrdersLastId] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [isStatusModal, setIsStatusModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState('전체')

  const SIZE = 10

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders`, {
        withCredentials: true,
      })
      setOrders(res.data.data)
    } catch (e) {
      console.error("전체 주문 조회 실패:", e)
    }
  }

  const fetchInfiniteOrders = async (lastId: number | null) => {
    setInfiniteOrdersLoading(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/infinite`, {
        params: {
          lastOrderId: lastId || undefined,
          size: SIZE,
        },
        withCredentials: true,
      })
      
      const newOrders = res.data.data

      setOrders(prev => {
        const merged = [...prev, ...newOrders]
        const unique = merged.filter(
          (item, index, self) =>
            index === self.findIndex(t => t.orderId === item.orderId)
        )
        return unique
      })

      setInfiniteOrders(prev => {
        const merged = [...prev, ...newOrders]
        const unique = merged.filter(
          (item, index, self) =>
            index === self.findIndex(t => t.orderId === item.orderId)
        )
        return unique
      })

      if (newOrders.length < SIZE) {
        setInfiniteOrdersHasMore(false)
      }

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

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status)
    setIsStatusModal(true)
  }

  const isWithinSevenDays = (dateString?: string) => {
    if (!dateString) return false
    const completedDate = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - completedDate.getTime())
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "전체") return ["취소", "반품", "교환"].includes(order.deliveryStatus)
    if (activeFilter === "취소") return order.deliveryStatus === "취소"
    if (activeFilter === "반품") return order.deliveryStatus === "반품"
    if (activeFilter === "교환") return order.deliveryStatus === "교환"
    return true
  })

  return {
    orders,
    infiniteOrders,
    infiniteOrdersLoading,
    infiniteOrdersHasMore,
    infiniteOrdersLastId,
    selectedStatus,
    isStatusModal,
    activeFilter,
    filteredOrders,
    setIsStatusModal,
    setActiveFilter,
    fetchOrders,
    fetchInfiniteOrders,
    resetInfiniteOrders,
    handleStatusClick,
    isWithinSevenDays,
  }
}