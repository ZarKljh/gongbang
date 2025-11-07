'use client'
import React, { useState } from 'react'
import { UserForm, StudioForm } from './component/index'
import { UserInfo, StudioInfo } from './types'
import { useRouter } from 'next/navigation'

export default function SellerSignupPage() {
    const [step, setStep] = useState(1)
    const router = useRouter()

    const [userInfo, setUserInfo] = useState<UserInfo>({
        email: '',
        password: '',
        confirmPassword: '',
        userName: '',
        fullName: '',
        gender: '',
        birth: '',
        nickName: '',
        mobilePhone: '',
        imageUrl: '',
    })

    const [studioInfo, setStudioInfo] = useState<StudioInfo>({
        categoryId: '',
        studioName: '',
        studioDescription: '',
        studioMobile: '',
        studioOfficeTell: '',
        studioFax: '',
        studioEmail: '',
        studioBusinessNumber: '',
        studioAddPostNumber: '',
        studioAddMain: '',
        studioAddDetail: '',
        studioMainImageUrl: '',
        studioLogoImageUrl: '',
        studioGalleryImageUrls: [],
    })

    const [previewMainImage, setPreviewMainImage] = useState<string | null>(null)
    const [previewLogoImage, setPreviewLogoImage] = useState<string | null>(null)
    const [previewGalleryImages, setPreviewGalleryImages] = useState<string[]>([])

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setUserInfo({ ...userInfo, [name]: value })
        //setUserInfo((prev) => ({ ...prev, [name]: value }));
    }

    const handleStudioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        // 파일 입력 처리
        if ('files' in e.target && e.target.files) {
            const files = e.target.files

            if (name === 'studioGalleryImages') {
                const fileArray = Array.from(files).slice(0, 5)
                const uploadPromises = fileArray.map((file) => uploadImageAndGetUrl(file))

                Promise.all(uploadPromises).then((urls) => {
                    const validUrls = urls.filter((url) => url !== undefined && url !== null)
                    setStudioInfo((prev) => ({
                        ...prev,
                        studioGalleryImageUrls: validUrls,
                    }))
                    setPreviewGalleryImages(fileArray.map((file) => URL.createObjectURL(file)))
                })
            } else {
                const file = files[0]
                uploadImageAndGetUrl(file).then((imageUrl) => {
                    if (name === 'studioMainImage') {
                        setStudioInfo((prev) => ({
                            ...prev,
                            studioMainImageUrl: imageUrl,
                        }))
                        setPreviewMainImage(URL.createObjectURL(file))
                    } else if (name === 'studioLogoImage') {
                        setStudioInfo((prev) => ({
                            ...prev,
                            studioLogoImageUrl: imageUrl,
                        }))
                        setPreviewLogoImage(URL.createObjectURL(file))
                    }
                })
            }
            return
        }
        setStudioInfo({ ...studioInfo, [name]: value })
        //setStudioInfo((prev) => ({ ...prev, [name]: value }));
    }

    const handleNext = function () {
        setStep(2)
    }

    const uploadImageAndGetUrl = async (file: File): Promise<string | undefined> => {
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('http://localhost:8090/api/v1/image/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                console.error('이미지 업로드 실패:', await res.text())
                return undefined
            }

            const data = await res.json()
            return data.imageUrl // ✅ 서버가 반환한 이미지 URL
        } catch (error) {
            console.error('이미지 업로드 중 오류 발생:', error)
            return undefined
        }
    }

    const handleSubmit = async () => {
        const { studioMainImageUrl, studioLogoImageUrl, studioGalleryImageUrls } = studioInfo

        if (
            !studioMainImageUrl ||
            !studioLogoImageUrl ||
            !studioGalleryImageUrls ||
            studioGalleryImageUrls.length === 0 ||
            studioGalleryImageUrls.some((url) => !url)
        ) {
            alert('이미지 업로드가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.')
            return
        }

        const payload = {
            ...userInfo,
            ...studioInfo,
            role: 'SELLER',
        }

        // ✅ 여기에서 콘솔로 확인
        console.log('회원가입 요청 payload:', payload)

        const response = await fetch('http://localhost:8090/api/v1/auth/signup/seller', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (response.ok) {
            alert('회원가입 완료! 로그인을 해주세요')
            router.push('/') // ✅ 메인페이지로 이동
        } else {
            alert('회원가입 실패')
        }
    }

    return (
        <section className="signup-container">
            <h3 className="signup-title">셀러 회원가입페이지</h3>
            {step === 1 && <UserForm userInfo={userInfo} onChange={handleUserChange} onNext={handleNext} />}
            {step === 2 && (
                <StudioForm
                    studioInfo={studioInfo}
                    onChange={handleStudioChange}
                    onSubmit={handleSubmit}
                    setStudioInfo={setStudioInfo}
                    previewMainImage={previewMainImage}
                    previewLogoImage={previewLogoImage}
                    previewGalleryImages={previewGalleryImages}
                />
            )}
        </section>
    )
}
