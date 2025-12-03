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
        imageUrls: [], // base64 미리보기용
    })

    // 실제 파일 저장용 배열
    const [imageFiles, setImageFiles] = useState([])

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
        // 파일 배열도 동일하게 정렬
        const reorderedFiles = Array.from(imageFiles)
        const [fileMoved] = reorderedFiles.splice(result.source.index, 1)
        reorderedFiles.splice(result.destination.index, 0, fileMoved)
        setImageFiles(reorderedFiles)
    }

    useEffect(() => {
        if (productId) {
            setReview((prev) => ({ ...prev, productId }))
        }
    }, [productId])

    // 리뷰 + 이미지 업로드 전체 완료
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (review.rating < 1) return alert('별점을 선택해주세요.')
        if (!review.content.trim()) return alert('내용을 입력해주세요.')

        const res = await api.post('/reviews', review)
        if (!res.data?.resultCode?.startsWith('200')) {
            return alert(res.data?.msg || '리뷰 등록 실패')
        }

        const reviewId = res.data.data.reviewId

        // 이미지 업로드
        for (let i = 0; i < imageFiles.length; i++) {
            const formData = new FormData()
            formData.append('file', imageFiles[i])
            formData.append('refId', reviewId.toString())
            formData.append('refType', 'REVIEW')
            formData.append('sortOrder', i.toString())

            await fetch('http://localhost:8090/api/v1/images/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })
        }

        alert('리뷰가 등록되었습니다.')
        router.push(`/product/list/detail?productId=${review.productId}`)
    }

    // 🔥 이미지 선택 + base64 미리보기 + 파일 저장
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files)

        if (imageFiles.length + files.length > 5) {
            alert('이미지는 최대 5장까지 등록할 수 있습니다.')
            return
        }

        // name, size 기준 이미지 중복체크
          const duplicates = files.filter(file =>
        imageFiles.some(f => f.name === file.name && f.size === file.size)
    )
        if (duplicates.length > 0) {
            alert('이미 선택된 이미지가 포함되어 있습니다.')
            e.target.value = ''
            return // 중복 있으면 함수 종료! 추가 절대 안 됨
        }
        const previews = []
        for (const file of files) {
            const base64 = await toBase64(file)
            previews.push(base64)
        }

        setReview((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, ...previews],
        }))

        setImageFiles((prev) => [...prev, ...files])

        // 같은 파일 다시 선택 가능 but 추가는 x (input 초기화)
        e.target.value = ''
    }

    // 이미지 삭제 시 파일목록도 삭제
    const handleRemoveImage = (index) => {
        setReview((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        }))
        setImageFiles((prev) => prev.filter((_, i) => i !== index))
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
                                    <>
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
                                                                src={url}
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
                                        </div>
                                        <p className="review-image-guide">이미지를 등록해주세요.( 최대 5장 )</p>
                                    </>
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
