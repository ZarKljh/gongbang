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
        gender: '',
        birth: '',
        nickName: '',
        mobilePhone: '',
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
    })

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setUserInfo({ ...userInfo, [name]: value })
        //setUserInfo((prev) => ({ ...prev, [name]: value }));
    }

    const handleStudioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setStudioInfo({ ...studioInfo, [name]: value })
        //setStudioInfo((prev) => ({ ...prev, [name]: value }));
    }

    const handleNext = function () {
        setStep(2)
    }

    const handleSubmit = async () => {
        const payload = {
            ...userInfo,
            ...studioInfo,
            role: 'SELLER',
        }

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
        <section>
            <h3>셀러 회원가입페이지</h3>
            {step === 1 && <UserForm userInfo={userInfo} onChange={handleUserChange} onNext={handleNext} />}
            {step === 2 && (
                <StudioForm
                    studioInfo={studioInfo}
                    onChange={handleStudioChange}
                    onSubmit={handleSubmit}
                    setStudioInfo={setStudioInfo}
                />
            )}
        </section>
    )
}
