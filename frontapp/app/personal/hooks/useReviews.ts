// app/personal/hooks/useReviews.ts
import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8090/api/v1'

export const useReviews = () => {
  const [infiniteReviews, setInfiniteReviews] = useState<any[]>([])
  const [infiniteReviewLoading, setInfiniteReviewLoading] = useState(false)
  const [infiniteReviewHasMore, setInfiniteReviewHasMore] = useState(true)
  const [infiniteReviewLastId, setInfiniteReviewLastId] = useState<number | null>(null)
  const [isEditReviewModal, setIsEditReviewModal] = useState(false)
  const [editReview, setEditReview] = useState<any>(null)
  const [editReviewContent, setEditReviewContent] = useState('')
  const [editReviewRating, setEditReviewRating] = useState(0)

  const fetchInfiniteReviews = async (lastId: number | null) => {
    if (infiniteReviewLoading) return
    if (!infiniteReviewHasMore && lastId !== null) return

    setInfiniteReviewLoading(true)

    try {
      const res = await axios.get(`${API_BASE_URL}/mypage/reviews/infinite`, {
        params: { lastReviewId: lastId, size: 10 },
        withCredentials: true
      })

      const newItems = res.data.data || []

      if (newItems.length === 0) {
        setInfiniteReviewHasMore(false)
        return
      }

      const newLastId = newItems[newItems.length - 1].reviewId
      if (newLastId === infiniteReviewLastId) {
        setInfiniteReviewHasMore(false)
        return
      }

      setInfiniteReviews(prev => {
        const merged = [...prev, ...newItems]
        const unique = merged.filter(
          (item, index, self) =>
            index === self.findIndex(r => r.reviewId === item.reviewId)
        )
        return unique
      })

      setInfiniteReviewLastId(newLastId)
      setInfiniteReviewHasMore(newItems.length === 10)

    } catch (e) {
      console.error("리뷰 무한스크롤 실패:", e)
    } finally {
      setInfiniteReviewLoading(false)
    }
  }

  const handleEditClick = (review: any) => {
    setEditReview(review)
    setEditReviewContent(review.content)
    setEditReviewRating(review.rating)
    setIsEditReviewModal(true)
  }

  const handleCloseModal = () => {
    setIsEditReviewModal(false)
    setEditReview(null)
    setEditReviewContent('')
    setEditReviewRating(0)
  }

  const handleSaveEdit = async () => {
    if (!editReview) return

    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/reviews/${editReview.reviewId}`,
        { rating: editReviewRating, content: editReviewContent },
        { withCredentials: true },
      )

      if (data.resultCode === '200') {
        alert('리뷰가 수정되었습니다.')
        setInfiniteReviews(prev =>
          prev.map(r =>
            r.reviewId === editReview.reviewId
              ? {
                  ...r,
                  rating: editReviewRating,
                  content: editReviewContent,
                  modifiedDate: new Date().toISOString(),
                }
              : r
          )
        )
        handleCloseModal()
      } else {
        alert(`수정 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error('리뷰 수정 실패:', error)
      alert('리뷰 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        alert('리뷰가 삭제되었습니다.')
        setInfiniteReviews(prev => prev.filter(r => r.reviewId !== reviewId))
      } else {
        alert(`삭제 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error('리뷰 삭제 실패:', error)
      alert('리뷰 삭제 중 오류가 발생했습니다.')
    }
  }

  return {
    infiniteReviews,
    infiniteReviewLoading,
    infiniteReviewHasMore,
    infiniteReviewLastId,
    isEditReviewModal,
    editReview,
    editReviewContent,
    editReviewRating,
    setInfiniteReviews,
    setInfiniteReviewHasMore,
    setInfiniteReviewLastId,
    setEditReviewContent,
    setEditReviewRating,
    fetchInfiniteReviews,
    handleEditClick,
    handleCloseModal,
    handleSaveEdit,
    handleDeleteReview,
  }
}