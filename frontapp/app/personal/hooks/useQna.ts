// app/personal/hooks/useQna.ts
import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

export const useQna = () => {
  const [qna, setQna] = useState<any[]>([])
  const [openQnaId, setOpenQnaId] = useState(null)

  const fetchQna = async (userId?: number) => {
    if (!userId) return
    
    try {
      const response = await axios.get(`${API_BASE_URL}/qna`, {
        params: { userId },
        withCredentials: true,
      })
      const list = Array.isArray(response.data.data) ? response.data.data : []
      setQna(list)
    } catch (error) {
      console.error('문의 목록 조회 실패:', error)
      setQna([])
    }
  }

  const handleDeleteQna = async (qnaId: number, userId: number) => {
    if (!confirm("정말 이 문의를 삭제하시겠습니까?")) return

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/qna/${qnaId}`, {
        params: { userId },
        withCredentials: true,
      })

      if (data.resultCode === "200") {
        alert("문의가 삭제되었습니다.")
        await fetchQna(userId)
      } else {
        alert(`삭제 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error("문의 삭제 실패:", error)
      alert("문의 삭제 중 오류가 발생했습니다.")
    }
  }

  const toggleQna = (id) => {
    setOpenQnaId(prev => (prev === id ? null : id))
  }

  return {
    qna,
    openQnaId,
    setQna,
    fetchQna,
    handleDeleteQna,
    toggleQna,
  }
}