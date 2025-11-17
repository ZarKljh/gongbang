'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaStar, FaPlus, FaTimes } from 'react-icons/fa'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function ReviewModify() {
    const params = useParams()
    const router = useRouter()
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
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${params.id}`)
            const data = await res.json()
            if (res.ok) {
                setReview(data.data)
            }
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

        const readers = files.map(
            (file) =>
                new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onload = (ev) => resolve(ev.target.result)
                    reader.readAsDataURL(file)
                }),
        )

        const base64List = await Promise.all(readers)
        setReview((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, ...base64List],
        }))
    }

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
            imageUrls: review.imageUrls,
        }

        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(reviewToSend),
            })

            if (res.ok) {
                alert('리뷰가 수정되었습니다.')
                router.push(`/review/${params.id}`)
            } else {
                alert('리뷰 수정 실패')
            }
        } catch (err) {
            console.error('❌ 수정 오류:', err)
        }
    }



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
            {/* 왼쪽: 수정 폼 */}
            <div style={{ width: '70%' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>리뷰 수정</h2>

                <form onSubmit={handleSubmit}>
                    {/* 별점 */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            별점을 다시 선택해주세요.
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

                    {/* 내용 */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            수정할 내용을 입력해주세요.
                        </p>
                        <textarea
                            name="content"
                            minLength={5}
                            maxLength={300}
                            value={review.content}
                            onChange={(e) =>
                                setReview((prev) => ({
                                    ...prev,
                                    content: e.target.value,
                                }))
                            }
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

                    {/* 이미지 업로드 */}
                    <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>이미지 수정</h3>

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
                                                        transform: snapshot.isDragging
                                                            ? 'scale(1.05)'
                                                            : 'scale(1)',
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
                                                        onClick={() =>
                                                            handleRemoveImage(index)
                                                        }
                                                        style={{
                                                            position: 'absolute',
                                                            top: '6px',
                                                            right: '6px',
                                                            background:
                                                                'rgba(0,0,0,0.6)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '22px',
                                                            height: '22px',
                                                            cursor: 'pointer',
                                                            transition: '0.2s',
                                                        }}
                                                        onMouseEnter={(e) =>
                                                            (e.currentTarget.style.background =
                                                                'rgba(0,0,0,0.8)')
                                                        }
                                                        onMouseLeave={(e) =>
                                                            (e.currentTarget.style.background =
                                                                'rgba(0,0,0,0.6)')
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
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.borderColor =
                                                    '#AD9263')
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.borderColor =
                                                    '#bbb')
                                            }
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
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <input
                        type="submit"
                        value="리뷰 수정하기"
                        style={{
                            backgroundColor: '#AD9263',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginTop: '10px',
                        }}
                    />
                </form>
            </div>

            {/* 오른쪽 안내 박스 */}
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
