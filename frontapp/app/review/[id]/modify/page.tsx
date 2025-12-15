'use client'

import '@/app/review/styles/ReviewModify.css'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaStar, FaPlus, FaTimes } from 'react-icons/fa'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Link from 'next/link'
import api from '@/app/utils/api'

export default function ReviewModify() {
    const params = useParams()
    const router = useRouter()
    const [imageFiles, setImageFiles] = useState([])
    const [review, setReview] = useState({
        rating: 0,
        content: '',
        imageUrls: [],
    })

    // 리뷰 불러오기
    useEffect(() => {
        if (!params?.id) return
        fetchReview()
    }, [params.id])

    const fetchReview = async () => {
        try {
            const res = await api.get(`/reviews/${params.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            })
            const data = res.data

            setReview(data.data)
        } catch (err) {
            console.error('리뷰 불러오기 실패:', err)
        }
    }

    // 드래그앤드롭 정렬
    const handleDragEnd = (result) => {
        if (!result.destination) return
        const reordered = Array.from(review.imageUrls)
        const [moved] = reordered.splice(result.source.index, 1)
        reordered.splice(result.destination.index, 0, moved)
        setReview((prev) => ({ ...prev, imageUrls: reordered }))
    }

    // 이미지 업로드
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files)
        if (review.imageUrls.length + files.length > 5) {
            alert('이미지는 최대 5장까지 등록할 수 있습니다.')
            return
        }

        // name, size 기준 이미지 중복체크
        const duplicates = files.filter((file) => imageFiles.some((f) => f.name === file.name && f.size === file.size))
        if (duplicates.length > 0) {
            alert('이미 선택된 이미지가 포함되어 있습니다.')
            e.target.value = ''
            return // 중복 있으면 함수 종료! 추가 절대 안 됨
        }

        // base64 미리보기만
        const previews = []
        for (const file of files) {
            previews.push(await toBase64(file))
        }

        setReview((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, ...previews],
        }))

        // 나중에 서버 업로드용 파일만 따로 저장
        setImageFiles((prev) => [...prev, ...files])

        // 같은 파일 다시 선택 가능 but 추가는 x (input 초기화)
        e.target.value = ''
    }

    // base64 변환 유틸
    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })

    // 이미지 삭제
    const handleRemoveImage = (index) => {
        setReview((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        }))
    }

    // 수정 요청
    const handleSubmit = async (e) => {
        e.preventDefault()

        const reviewToSend = {
            rating: review.rating,
            content: review.content,
            imageUrls: review.imageUrls.filter((url) => !url.startsWith('data:')), // base64 + 기존 저장된 URL
        }

        // 1) 리뷰 본문 먼저 PATCH
        let patchRes
        try {
            patchRes = await api.patch(`/reviews/${params.id}`, reviewToSend, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                withCredentials: true,
            })
        } catch (err) {
            console.error(err)
            return alert('리뷰 수정 중 오류가 발생했습니다.')
        }

        if (!patchRes.data?.resultCode?.startsWith('200')) {
            return alert(patchRes.data?.msg || '리뷰 수정 실패')
        }

        // 2) 새로 추가된 파일만 업로드
        let failedCount = 0

        for (let i = 0; i < imageFiles.length; i++) {
            const formData = new FormData()
            formData.append('file', imageFiles[i])
            formData.append('refId', params.id.toString())
            formData.append('refType', 'REVIEW')
            formData.append('sortOrder', i.toString())

            try {
                await api.post('/images/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true,
                })
            } catch (err) {
                console.error('이미지 업로드 실패:', err)
                failedCount++
            }
        }
        if (failedCount > 0) {
            alert(`리뷰는 수정되었지만 이미지 ${failedCount}장은 업로드에 실패했습니다.`)
        } else {
            alert('리뷰가 수정되었습니다.')
        }

        router.push(`/review/${params.id}`)
    }

    return (
        <div className="review-modify-wrapper">
            <div className="review-modify-container">
                <Link href={`/review/${review?.reviewId}`} className="review-back-btn">
                    ← 뒤로가기
                </Link>
                <h2 className="review-modify-title">리뷰 수정</h2>

                <form onSubmit={handleSubmit}>
                    {/* 별점 */}
                    <div className="review-modify-rating-wrapper">
                        <p className="review-modify-label">별점을 다시 선택해주세요.</p>
                        <div className="review-modify-rating-select">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <FaStar
                                    key={num}
                                    size={40}
                                    className={`review-modify-star ${num <= review.rating ? 'active' : ''}`}
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

                    {/* 내용 */}
                    <div className="review-modify-content-wrapper">
                        <p className="review-modify-label">수정할 내용을 입력해주세요.</p>
                        <textarea
                            minLength={5}
                            maxLength={300}
                            value={review.content}
                            onChange={(e) =>
                                setReview((prev) => ({
                                    ...prev,
                                    content: e.target.value,
                                }))
                            }
                            className="review-modify-textarea"
                            placeholder="5자 이상 입력해주세요."
                        />
                    </div>

                    {/* 이미지 */}
                    <h3 className="review-modify-subtitle">이미지 수정</h3>
                    <div className="review-modify-image-upload-wrapper">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="images" direction="horizontal">
                                {(provided) => (
                                    <>
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="review-modify-image-list"
                                        >
                                            {review.imageUrls.map((url, index) => (
                                                <Draggable key={url} draggableId={url} index={index}>
                                                    {(prov, snapshot) => (
                                                        <div
                                                            ref={prov.innerRef}
                                                            {...prov.draggableProps}
                                                            {...prov.dragHandleProps}
                                                            className={`review-modify-image-card ${
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
                                                                className="review-modify-image"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(index)}
                                                                className="review-modify-image-remove-btn"
                                                            >
                                                                <FaTimes size={10} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {review.imageUrls.length < 5 && (
                                                <label htmlFor="fileUpload" className="review-modify-image-add-btn">
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
                    <input type="submit" value="리뷰 수정하기" className="review-modify-submit-btn" />
                    {/* 안내 박스 (👇 ReviewCreate처럼 하단으로 이동 */}
                    <div className="review-modify-guide-box">
                        <p className="review-modify-guide-text">
                            <b>* 이런 후기는 삭제될 수 있어요.</b> <br />
                            비속어, 타인 비방, 도배성 문구가 포함된 후기는 노출이 제한될 수 있습니다.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
