"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import api from "@/app/utils/api"

const API_BASE_URL = `${api.defaults.baseURL}`

export const useOrders = () => {
  const [orders, setOrders] = useState<any[]>([])

  // 무한스크롤
  const [infiniteOrders, setInfiniteOrders] = useState<any[]>([])
  const [infiniteOrdersLoading, setInfiniteOrdersLoading] = useState(false)
  const [infiniteOrdersHasMore, setInfiniteOrdersHasMore] = useState(true)
  const [infiniteOrdersLastId, setInfiniteOrdersLastId] = useState<number | null>(null)
  const SIZE = 10

  // 모달/필터
  const [openOrderId, setOpenOrderId] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [isStatusModal, setIsStatusModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState("전체")

  // 취소/반품/교환 사유 모달
  const [isReasonModal, setIsReasonModal] = useState(false)
  const [reasonModalTitle, setReasonModalTitle] = useState("")
  const [reasonModalOnSubmit, setReasonModalOnSubmit] =
    useState<null | ((reason: string) => void)>(null)
  const [reasonText, setReasonText] = useState("")
  const HIDDEN_STATUSES = ['CANCELLED', 'RETURNED', 'EXCHANGED']

  // API - 전체 주문 조회
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/mypage/orders`, { withCredentials: true })
      setOrders(res.data.data || [])
    } catch (e) {
      console.error("전체 주문 조회 실패:", e)
    }
  }

  // 배송완료 7일 조건
  const isWithinSevenDays = (dateString?: string) => {
    if (!dateString) return false
    const completedDate = new Date(dateString)
    const now = new Date()
    return (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
  }

  const filterOrdersByStatus = (status) => {
    return orders.filter((o) => {
      if (o.status !== "PAID") return false
      if (o.deliveryStatus !== status) return false

      if (status === "배송완료") {
        return o.completedAt && isWithinSevenDays(o.completedAt)
      }

      return true
    })
  }

  const visibleOrders = filterOrdersByStatus(selectedStatus).filter(
    (order) => !HIDDEN_STATUSES.includes(order.status)
  )

  // 무한스크롤 데이터 로드
  const fetchInfiniteOrders = async (lastId: number | null) => {
    if (infiniteOrdersLoading || (!infiniteOrdersHasMore && lastId !== null)) return

    setInfiniteOrdersLoading(true)

    try {
      const res = await axios.get(`${API_BASE_URL}/mypage/orders/infinite`, {
        params: { lastOrderId: lastId || undefined, size: SIZE },
        withCredentials: true,
      })

      const newOrders = res.data.data || []

      // 중복 제거 병합
      setInfiniteOrders(prev => {
        const merged = [...prev, ...newOrders]
        return merged.filter((o, i, arr) => i === arr.findIndex(t => t.orderId === o.orderId))
      })

      setOrders(prev => {
        const merged = [...prev, ...newOrders]
        return merged.filter((o, i, arr) => i === arr.findIndex(t => t.orderId === o.orderId))
      })

      if (newOrders.length > 0)
        setInfiniteOrdersLastId(newOrders[newOrders.length - 1].orderId)
      if (newOrders.length < SIZE)
        setInfiniteOrdersHasMore(false)

    } catch (e) {
      console.error("무한스크롤 주문 조회 실패:", e)
    } finally {
      setInfiniteOrdersLoading(false)
    }
  }

  const resetInfiniteOrders = () => {
    setInfiniteOrders([])
    setInfiniteOrdersLastId(null)
    setInfiniteOrdersHasMore(true)
  }

  // 필터 주문
  const filteredOrders = orders.filter(order => {
    if (activeFilter === "ALL") return true
    return order.status === activeFilter
  })

  const ORDER_STATUS_LABEL: Record<string, string> = {
    CANCELLED: '취소',
    RETURN: '반품',
    EXCHANGE: '교환',
    PAID: '결제완료',
  }

  // 모달 클릭
  const handleStatusClick = (status: string) => {
    setSelectedStatus(status)
    setIsStatusModal(true)
  }

  const toggleOrderDetail = (orderId: number) => {
    setOpenOrderId(prev => (prev === orderId ? null : orderId))
  }

  const submitReason = async () => {
    if (!reasonModalOnSubmit) return
    await reasonModalOnSubmit(reasonText)
    setIsReasonModal(false)
    setReasonText("")
  }

  return {
    orders,
    infiniteOrders,
    infiniteOrdersLoading,
    infiniteOrdersHasMore,
    infiniteOrdersLastId,
    filteredOrders,

    selectedStatus,
    activeFilter,
    isStatusModal,
    openOrderId,
    isReasonModal,
    reasonModalTitle,
    reasonText,

    setActiveFilter,
    setIsStatusModal,
    setIsReasonModal,
    setReasonModalTitle,
    setReasonModalOnSubmit,
    setReasonText,

    fetchOrders,
    fetchInfiniteOrders,
    resetInfiniteOrders,
    handleStatusClick,
    toggleOrderDetail,
    submitReason,
    filterOrdersByStatus,
    ORDER_STATUS_LABEL,
    visibleOrders,
  }
}