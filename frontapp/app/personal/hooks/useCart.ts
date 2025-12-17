"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import api from '@/app/utils/api'

const API_BASE_URL = `${api.defaults.baseURL}/mypage`


export const useCart = () => {
  // ============ 장바구니 ============  
  const [cart, setCart] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  // 장바구니 불러오기
  const fetchCart = async (userId?: number) => {
    if (!userId) return

    try {
      const { data } = await axios.get(`${API_BASE_URL}/cart`, {
        params: { userId: userId },
        withCredentials: true,
      })
      const list = Array.isArray(data.data) ? data.data : []
      setCart(list)
    } catch (error) {
      console.error("장바구니 조회 실패:", error)
      setCart([])
    }
  }

  // 수량 수정
  const handleUpdateCart = async (cartId: number, quantity: number) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/cart/${cartId}?quantity=${quantity}`,
        {},
        { withCredentials: true }
      )

      const newQty = data.data.quantity

      setCart(prev =>
        prev.map(item =>
          item.cartId === cartId ? { ...item, quantity: newQty } : item
        )
      )
    } catch (error) {
      console.error("장바구니 수량 수정 실패:", error)
      alert("수량 수정 실패")
    }
  }

  // 삭제
  const handleDeleteCart = async (cartId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/cart/${cartId}`, {
        withCredentials: true,
      })

      setCart(prev => prev.filter(item => item.cartId !== cartId))
      setSelectedItems(prev => prev.filter(id => id !== cartId))
    } catch (error) {
      console.error("장바구니 삭제 실패:", error)
      alert("삭제 실패")
    }
  }

  // 선택 기능
  const handleSelectItem = (cartId: number, isChecked: boolean) => {
    setSelectedItems(prev =>
      isChecked ? [...prev, cartId] : prev.filter(id => id !== cartId)
    )
  }

  const handleToggleSelectAll = () => {
    if (selectedItems.length === cart.length) setSelectedItems([])
    else setSelectedItems(cart.map(item => item.cartId))
  }

  const handleClearSelection = () => setSelectedItems([])

  // 선택된 상품 목록
  const selectedProducts = cart
    .filter(item => selectedItems.includes(item.cartId))
    .map(item => ({
      name: item.productName,
      quantity: item.quantity,
      amount: item.price * item.quantity,
    }))

  return {
    // 장바구니
    cart,
    selectedItems,
    selectedProducts,

    // 상태 변경
    setCart,
    setSelectedItems,

    // 장바구니 CRUD
    fetchCart,
    handleUpdateCart,
    handleDeleteCart,

    // 선택 기능
    handleSelectItem,
    handleToggleSelectAll,
    handleClearSelection,
  }
}