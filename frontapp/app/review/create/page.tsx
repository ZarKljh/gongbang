'use client'

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
        <div
            style={{
                fontFamily: 'P-Regular',
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
                                display: 'flex',
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
                            <input
                                type="submit"
                                value="리뷰 등록하기"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginLeft: 'auto',
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
                    </div>

                    {/* 리뷰 작성 */}
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
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="images" direction="horizontal">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '10px',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        {review.imageUrls.map((url, index) => (
                                            <Draggable key={url} draggableId={url} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            position: 'relative',
                                                            width: '120px',
                                                            height: '120px',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            border: '1px solid #ccc',
                                                            boxShadow: snapshot.isDragging
                                                                ? '0 4px 12px rgba(0,0,0,0.3)'
                                                                : '0 2px 6px rgba(0,0,0,0.1)',
                                                            transform: snapshot.isDragging ? 'scale(1.05)' : 'scale(1)',
                                                            transition: 'all 0.2s ease',
                                                            backgroundColor: '#fff',
                                                            ...provided.draggableProps.style,
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                url.startsWith('data:')
                                                                    ? url
                                                                    : `http://localhost:8090${url}`
                                                            }
                                                            alt={`리뷰 이미지 ${index + 1}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '6px',
                                                                right: '6px',
                                                                background: 'rgba(0,0,0,0.6)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '22px',
                                                                height: '22px',
                                                                cursor: 'pointer',
                                                                transition: '0.2s',
                                                            }}
                                                            onMouseEnter={(e) =>
                                                                (e.currentTarget.style.background = 'rgba(0,0,0,0.8)')
                                                            }
                                                            onMouseLeave={(e) =>
                                                                (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')
                                                            }
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
                                            <label
                                                htmlFor="fileUpload"
                                                style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    border: '2px dashed #bbb',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    color: '#777',
                                                    cursor: 'pointer',
                                                    fontSize: '20px',
                                                    backgroundColor: '#fafafa',
                                                    transition: '0.2s',
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#AD9263')}
                                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#bbb')}
                                            >
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

                                        <p>이미지를 등록해주세요.( 최대 5장 )</p>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>

                    {/* ✅ 현재 추가된 이미지 미리보기 */}
                    {review.imagePreviews && review.imagePreviews.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>첨부된 이미지</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {review.imagePreviews.map((url, i) => (
                                    <img
                                        key={i}
                                        src={url}
                                        alt={`preview-${i}`}
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
                    <Link
                        href={{
                            pathname: '/product/list/detail',
                            query: { productId: review?.productId },
                        }}
                        style={{
                            display: 'inline-block',
                            backgroundColor: '#ddd',
                            color: '#333',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: 'bold',
                            marginTop: '10px',
                        }}
                    >
                        ← 목록으로 돌아가기
                    </Link>
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
                    비속어, 타인 비방, 도배성 문구가 포함된 후기는 노출이 제한될 수 있습니다.
                    <br /> 솔직한 경험을 나눠주세요.
                </p>
            </div>
        </div>
    )
}
