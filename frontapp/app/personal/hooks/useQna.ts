"use client"

import { useState } from 'react'
import axios from 'axios'
import api from '@/app/utils/api'

const API_BASE_URL = `${api.defaults.baseURL}/mypage`

export const useQna = (userId?: number, onCountChange?: (count: number) => void) => {
  const [qna, setQna] = useState<any[]>([])
  const [openQnaId, setOpenQnaId] = useState<number | null>(null)

  // ===== QnA 조회 =====
  const fetchQna = async (uid?: number) => {
    const targetUserId = uid || userId
    if (!targetUserId) return
    
    try {
      const response = await axios.get(`${API_BASE_URL}/qna`, {
        params: { userId: targetUserId },
        withCredentials: true,
      })

      const list = Array.isArray(response.data.data) ? response.data.data : []
      setQna(list)

      // 문의 개수 변경 콜백 실행
      onCountChange?.(list.length)

    } catch (error) {
      console.error('문의 목록 조회 실패:', error)
      setQna([])
      onCountChange?.(0)
    }
  }

  // ===== QnA 삭제 =====
  const handleDeleteQna = async (qnaId: number, uid?: number) => {
    const targetUserId = uid || userId
    if (!targetUserId) return

    if (!confirm("정말 이 문의를 삭제하시겠습니까?")) return

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/qna/${qnaId}`, {
        params: { userId: targetUserId },
        withCredentials: true,
      })

      if (data.resultCode === "200") {
        alert("문의가 삭제되었습니다.")

        // UI에서 바로 제거
        setQna(prev => prev.filter(item => item.qnaId !== qnaId))

        // 개수 업데이트
        onCountChange?.(qna.length - 1)
      } 
      else {
        alert(`삭제 실패: ${data.msg}`)
      }

    } catch (error) {
      console.error("문의 삭제 실패:", error)
      alert("문의 삭제 중 오류가 발생했습니다.")
    }
  }

  // ===== 열기/닫기 =====
  const toggleQna = (id: number) => {
    setOpenQnaId(prev => (prev === id ? null : id))
  }

  return {
    qna,
    openQnaId,

    fetchQna,
    handleDeleteQna,
    toggleQna,
  }
}