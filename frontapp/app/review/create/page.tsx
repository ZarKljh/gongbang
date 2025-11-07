'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaStar, FaPlus } from 'react-icons/fa'
import api from '@/app/utils/api'
import Link from 'next/link'

export default function ReviewCreate({ fetchReviews }) {
    const router = useRouter()
    const [idCounter, setIdCounter] = useState({
        orderId: 1,
        orderItemId: 1,
        productId: 1,
    })

    const [review, setReview] = useState({
        orderId: 1,
        orderItemId: 1,
        productId: 1,
        rating: 0,
        content: '',
        imageUrls: [],
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        const newValue = name === 'rating' ? Number(value) : value
        setReview({ ...review, [name]: newValue })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (review.rating < 1) {
            alert('별점을 선택해주세요. (1~5)')
            return
        }
        if (!review.content.trim()) {
            alert('내용을 입력해주세요.')
            return
        }

        const nextIds = {
            orderId: idCounter.orderId + 1,
            orderItemId: idCounter.orderItemId + 1,
            productId: idCounter.productId + 1,
            // userId: idCounter.userId + 1,
        }

        const reviewToSend = {
            ...review,
            ...nextIds,
        }

        try {
            const res = await api.post('/reviews', review)
            if (res.status === 200 || res.status === 201) {
                alert('리뷰가 등록되었습니다.')
                router.push('/review')
            }
        } catch (err) {
            alert('리뷰 등록 실패')
        }
    }

    // ✅ 이미지 업로드 임시 기능
    const handleImageUpload = () => {
        const url = prompt('이미지 URL을 입력해주세요 (예: https://example.com/img.jpg)')
        if (url) {
            setReview((prev) => ({
                ...prev,
                imageUrls: [...prev.imageUrls, url],
            }))
        }
    }

    return (
        <div
            style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '40px 20px',
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            {/* 왼쪽: 리뷰 작성 섹션 */}
            <div style={{ width: '70%' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>리뷰 등록</h2>

                <form onSubmit={handleSubmit}>
                    {/* 별점 */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            상품은 만족하셨나요? 별점을 선택해주세요.
                        </p>
                        <div
                            style={{
                                borderBottom: '1px solid #ccc',
                                paddingBottom: '10px',
                                marginBottom: '20px',
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <FaStar
                                    key={num}
                                    size={40}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'color 0.2s ease',
                                        marginRight: '8px',
                                    }}
                                    color={num <= review.rating ? '#FFD700' : '#E0E0E0'}
                                    onClick={() =>
                                        setReview((prev) => ({
                                            ...prev,
                                            rating: num,
                                        }))
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    {/* 후기 작성 */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>5자 이상, 300자 이하</p>
                        <textarea
                            name="content"
                            minLength={5}
                            maxLength={300}
                            onChange={handleChange}
                            value={review.content}
                            placeholder="5자 이상 입력해주세요."
                            style={{
                                width: '90%',
                                height: '200px',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                padding: '10px',
                                resize: 'none',
                                backgroundColor: '#f5f5f5',
                            }}
                        />
                    </div>

                     {/* 이미지 업로드 + 등록 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #ccc',
              paddingTop: '20px',
            }}
          >
            <div
              onClick={handleImageUpload}
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'black',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  border: '2px solid #bfbfbf',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '24px',
                  borderRadius: '6px',
                  marginRight: '10px',
                  color: '#666',
                }}
              >
                <FaPlus />
              </div>
              <span style={{ fontSize: '16px' }}>이미지 업로드하기</span>
            </div>

            <input
              type="submit"
              value="리뷰 등록하기"
              style={{
                backgroundColor: '#AD9263',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginRight: '10px',
              }}
            />
          </div>

          {/* ✅ 현재 추가된 이미지 미리보기 */}
          {review.imageUrls.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>첨부된 이미지</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {review.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`review-img-${i}`}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

            {/* 오른쪽: 안내 섹션 */}
            <div
                style={{
                    width: '25%',
                    backgroundColor: '#E8E8E8',
                    borderRadius: '8px',
                    padding: '20px',
                    color: '#555',
                    fontSize: '14px',
                    lineHeight: '1.6',
                }}
            >
                <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>이런 후기는 삭제될 수 있어요.</p>
                <p>
                    ~~~~~~~~~~~~~~~~~~~~
                    <br />
                    사용하면서 어땠고~~어쩌고 솔직한 후기를 남겨주세요 😊
                </p>
            </div>
        </div>
    )
}
