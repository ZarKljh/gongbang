'use client'

import '@/app/review/styles/ReviewCreate.css'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaStar, FaPlus, FaTimes } from 'react-icons/fa'
import api from '@/app/utils/api'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function ReviewCreate() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const productIdParam = searchParams.get('productId')
    const productId = productIdParam ? Number(productIdParam) : null
    const [idCounter, setIdCounter] = useState({
        orderId: 1,
        orderItemId: 1,
    })

    const [review, setReview] = useState({
        orderId: 1,
        orderItemId: 1,
        productId: productId,
        rating: 0,
        content: '',
        imageUrls: [],
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setReview((prev) => ({
            ...prev,
            [name]: name === 'rating' ? Number(value) : value,
        }))
    }

    // 드래그앤드롭 정렬
    const handleDragEnd = (result) => {
        if (!result.destination) return
        const reordered = Array.from(review.imageUrls)
        const [moved] = reordered.splice(result.source.index, 1)
        reordered.splice(result.destination.index, 0, moved)
        setReview((prev) => ({ ...prev, imageUrls: reordered }))
    }

    useEffect(() => {
        if (productId) {
            setReview((prev) => ({ ...prev, productId }))
        }
    }, [productId])

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
        }

        const reviewToSend = {
            ...review,
            ...nextIds,
        }

        const res = await api.post('/reviews', reviewToSend)

        if (res.data?.resultCode?.startsWith('200')) {
            alert('리뷰가 등록되었습니다.')
            router.push(`/product/list/detail?productId=${review.productId}`)
        } else {
            alert(res.data?.msg || '리뷰 등록 실패')
        }
    }

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files)
        if (review.imageUrls.length + files.length > 5) {
            alert('이미지는 최대 5장까지 등록할 수 있습니다.')
            return
        }

        const token = localStorage.getItem('accessToken')

        const previews = []
        const uploadedUrls = []

        for (const file of files) {
            // 1️⃣ 미리보기용 base64
            const base64 = await toBase64(file)
            previews.push(base64)

            // 2️⃣ 서버 업로드
            const formData = new FormData()
            formData.append('file', file)

            try {
                const res = await fetch('http://localhost:8090/api/v1/images/upload', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                })
                const url = await res.text()
                uploadedUrls.push(url)
            } catch (err) {
                console.error('❌ 업로드 실패:', err)
            }
        }

        // 이미지 삭제
        const handleRemoveImage = (index) => {
            setReview((prev) => ({
                ...prev,
                imageUrls: prev.imageUrls.filter((_, i) => i !== index),
            }))
        }

        // 3️⃣ base64 → 즉시 미리보기, url은 나중에 서버 저장용
        setReview((prev) => ({
            ...prev,
            imagePreviews: [...(prev.imagePreviews || []), ...previews],
            imageUrls: [...prev.imageUrls, ...uploadedUrls],
        }))
    }

    // base64 변환 유틸
    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })

    return (
        <div className="review-create-wrapper">
            <div className="review-create-container">
                <Link
                    href={{
                        pathname: '/product/list/detail',
                        query: { productId: review?.productId },
                    }}
                    className="review-back-link"
                >
                    ← 목록으로
                </Link>
                <h2 className="review-create-title">리뷰 등록</h2>

                <form onSubmit={handleSubmit}>
                    {/* 별점 */}
                    <div className="review-create-star-wrapper">
                        <p className="review-create-label">상품은 만족하셨나요? 별점을 선택해주세요.</p>

                        <div className="review-create-star-select">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <FaStar
                                    key={num}
                                    size={40}
                                    className={`review-star ${num <= review.rating ? 'active' : ''}`}
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

                    {/* 리뷰 작성 */}
                    <div className="review-create-content-wrapper">
                        <p className="review-create-label">5자 이상, 300자 이하</p>
                        <textarea
                            name="content"
                            minLength={5}
                            maxLength={300}
                            onChange={handleChange}
                            value={review.content}
                            placeholder="5자 이상 입력해주세요."
                            className="review-create-textarea"
                        />
                    </div>

                    {/* 이미지 업로드 영역 */}
                    <div className="review-image-upload-wrapper">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="images" direction="horizontal">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="review-image-list"
                                    >
                                        {review.imageUrls.map((url, index) => (
                                            <Draggable key={url} draggableId={url} index={index}>
                                                {(prov, snapshot) => (
                                                    <div
                                                        ref={prov.innerRef}
                                                        {...prov.draggableProps}
                                                        {...prov.dragHandleProps}
                                                        className={`review-image-card ${
                                                            snapshot.isDragging ? 'dragging' : ''
                                                        }`}
                                                        style={prov.draggableProps.style}
                                                    >
                                                        <img
                                                            src={
                                                                url.startsWith('data:')
                                                                    ? url
                                                                    : `http://localhost:8090${url}`
                                                            }
                                                            alt={`리뷰 이미지 ${index + 1}`}
                                                            className="review-image"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="review-image-remove-btn"
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {/* 추가 버튼 */}
                                        {review.imageUrls.length < 5 && (
                                            <label htmlFor="fileUpload" className="review-image-add-btn">
                                                <FaPlus />
                                                <input
                                                    id="fileUpload"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        )}
                                        <p className="review-image-guide">이미지를 등록해주세요.( 최대 5장 )</p>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>

                    {/* 등록 버튼 */}
                    <input type="submit" value="리뷰 등록하기" className="review-create-submit-btn" />

                    {/* 안내 텍스트 */}
                    <div className="review-create-guide-box">
                        <p className="review-create-guide-text">
                            <b>* 이런 후기는 삭제될 수 있어요.</b> <br />
                            비속어, 타인 비방, 도배성 문구가 포함된 후기는 노출이 제한될 수 있습니다.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
