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
        studioMainImageName: '',
        studioLogoImageName: '',
        studioGalleryImageNames: [],
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
                const localUrls = fileArray.map((file) => URL.createObjectURL(file))
                const fileNames = fileArray.map((file) => file.name) // ✅ 파일명 배열 생성

                setStudioInfo((prev) => ({
                    ...prev,
                    studioGalleryImageUrls: localUrls,
                    studioGalleryImageNames: fileNames,
                }))
                setPreviewGalleryImages(localUrls)
            } else {
                const file = files[0]
                const localUrl = URL.createObjectURL(file)

                if (name === 'studioMainImage') {
                    setStudioInfo((prev) => ({
                        ...prev,
                        studioMainImageUrl: localUrl,
                        studioMainImageName: file.name,
                    }))
                    setPreviewMainImage(localUrl)
                } else if (name === 'studioLogoImage') {
                    setStudioInfo((prev) => ({
                        ...prev,
                        studioLogoImageUrl: localUrl,
                        studioLogoImageName: file.name,
                    }))
                    setPreviewLogoImage(localUrl)
                }
            }
            return
        }
        setStudioInfo((prev) => ({ ...prev, [name]: value }))
        //setStudioInfo((prev) => ({ ...prev, [name]: value }));
    }

    const handleNext = function () {
        setStep(2)
    }

    const handleSubmit = async () => {
        const { studioMainImageUrl, studioLogoImageUrl, studioGalleryImageUrls } = studioInfo
        if (!studioMainImageUrl || !studioLogoImageUrl || studioGalleryImageUrls.length === 0) {
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
