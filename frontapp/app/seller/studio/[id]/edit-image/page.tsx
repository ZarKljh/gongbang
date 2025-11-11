'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditStudioImage() {
    const { id: studioId } = useParams()
    const router = useRouter()

    /* null>(null) 상태 초기값은 (null) 타입은 File 또는 null*/
    /* <File | null > 파일이 있을 수도 있고 null일수도 있다는 의미 */

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

    // ✅ 기존 이미지 불러오기
    useEffect(() => {
        const fetchExistingImage = async () => {
            try {
                const response = await fetch(`http://localhost:8090/api/v1/studio/${studioId}/image`, {
                    method: 'GET',
                    credentials: 'include',
                })
                if (response.ok) {
                    const result = await response.json()
                    setExistingImageUrl(result.data.imageUrl)
                }
            } catch (error) {
                console.error('기존 이미지 불러오기 실패:', error)
            }
        }

        fetchExistingImage()
    }, [studioId])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async () => {
        if (!imageFile) {
            alert('이미지를 선택해주세요.')
            return
        }

        const formData = new FormData()
        formData.append('image', imageFile)

        try {
            const response = await fetch(`http://localhost:8090/api/v1/studio/${studioId}/studio-main-image`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error('이미지 업로드 실패 : ' + errorText)
            }

            alert('대표 이미지가 변경되었습니다.')
            router.push(`/seller/studio/${studioId}`)
        } catch (error) {
            alert('오류가 발생했습니다.')
            alert(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
        }
    }

    return (
        <div className="edit-image-page">
            <h2>대표 이미지 변경</h2>

            {/* ✅ 기존 이미지 표시 */}
            {existingImageUrl && !previewUrl && (
                <div className="image-preview">
                    <p>현재 대표 이미지:</p>
                    <img
                        src={`http://localhost:8090${existingImageUrl}`}
                        alt="기존 대표 이미지"
                        style={{ maxWidth: '300px' }}
                    />
                </div>
            )}

            <input type="file" accept="image/*" onChange={handleImageChange} />

            {/* ✅ 새 이미지 미리보기 */}
            {previewUrl && (
                <div className="image-preview">
                    <p>선택한 이미지 미리보기:</p>
                    <img src={previewUrl} alt="미리보기 이미지" style={{ maxWidth: '300px', marginTop: '10px' }} />
                </div>
            )}

            <button onClick={handleSubmit}>이미지 업로드</button>
            <button onClick={() => router.back()}>취소</button>
        </div>
    )
}
