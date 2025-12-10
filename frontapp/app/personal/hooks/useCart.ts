// app/personal/hooks/useCart.ts
import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

export const useCart = () => {
  const [cart, setCart] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const fetchCart = async (userId?: number) => {
    if (!userId) return

    try {
      const { data } = await axios.get(`${API_BASE_URL}/cart`, {
        withCredentials: true,
      })

      const list = Array.isArray(data.data) ? data.data : []
      setCart(list)
    } catch (error) {
      console.error('장바구니 목록 조회 실패:', error)
      setCart([])
    }
  }

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
      await axios.delete(`${API_BASE_URL}/cart/${cartId}`, { withCredentials: true })
      setCart(prev => prev.filter(item => item.cartId !== cartId))
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

  const handleToggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cart.map(item => item.cartId))
    }
  }

  const handleClearSelection = () => {
    setSelectedItems([])
  }

  const selectedProducts = cart
    .filter(item => selectedItems.includes(item.cartId))
    .map(item => ({
      name: item.productName,
      quantity: item.quantity,
      amount: item.price * item.quantity,
    }))

  return {
    cart,
    selectedItems,
    selectedProducts,
    setCart,
    setSelectedItems,
    fetchCart,
    handleUpdateCart,
    handleDeleteCart,
    handleSelectItem,
    handleToggleSelectAll,
    handleClearSelection,
  }
}