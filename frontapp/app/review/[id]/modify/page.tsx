'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import api from '@/app/utils/api'

export default function ReviewModify() {
    const params = useParams()
    const router = useRouter()
    // const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 상태
    const [review, setReview] = useState({
        rating: 0,
        content: '',
    })


    useEffect(() => {
        if (!params?.id) return // id 없으면 fetch 안 함
        fetchReview()
    }, [params.id])

    const fetchReview = () => {
        fetch(`http://localhost:8090/api/v1/reviews/${params.id}`)
            .then((result) => result.json())
            .then((result) => setReview(result.data.review))
            .catch((err) => console.error(err))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const reviewToSend = {
            rating: review.rating,
            content: review.content,
        }

        const response = await fetch(`http://localhost:8090/api/v1/reviews/${params.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(reviewToSend),
        })

        if (response.ok) {
            alert('modify success')
            router.push(`/review/${params.id}`)
        } else {
            alert('modify fail')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        const newValue = name === 'rating' ? Number(value) : value
        setReview((prev) => ({ ...prev, [name]: newValue }))
    }

    return (
        <div>
            <h2>리뷰 수정</h2>
            <form onSubmit={handleSubmit}>
                {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num}>
                        <input
                            type="radio"
                            name="rating"
                            value={num}
                            checked={review.rating === num}
                            onChange={handleChange}
                        />
                        {num}점
                    </label>
                ))}
                <br />
                <div className="review-content">
                    <label>
                        내용 :
                        <input
                            style={{
                                height: '200px',
                                width: '400px',
                                border: '2px solid black',
                                borderRadius: '10px',
                            }}
                            type="text"
                            name="content"
                            minLength={5}
                            onChange={handleChange}
                            value={review.content}
                            placeholder="5자 이상 300자 이하"
                        />
                    </label>
                </div>
                <br />
                <input type="submit" value="수정하기" />
            </form>
        </div>
    )
}
