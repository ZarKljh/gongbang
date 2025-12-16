'use client'
import React, { useState } from 'react'
import { UserForm, StudioForm } from './component/index'
import { UserInfo, StudioInfo } from './types'
import { useRouter } from 'next/navigation'
import { signupUserValidation } from '@/app/auth/hooks/signupUserValidation'
import { signupSellerValidation } from '@/app/auth/hooks/signupSellerValidation'
import { api } from '@/app/utils/api'
import '@/app/auth/signup/user/signup_user.css'

export default function SellerSignupPage() {
    const [step, setStep] = useState(1)
    const router = useRouter()
    const { errors, validate, validateField: validateUserField } = signupUserValidation()
    const {
        errors: studioErrors,
        validate: validateStudio,
        validateField: validateStudioField,
    } = signupSellerValidation()
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
        profileImageFile: null,
        profileImageUrl: '', // 이미지 URL (예: 서버에 업로드된 경로)
        profileImageName: '', // 이미지 파일명
    })

    const [userNameCheckMsg, setUserNameCheckMsg] = useState('')
    const [nickNameCheckMsg, setNickNameCheckMsg] = useState('')
    const [isUserNameValid, setIsUserNameValid] = useState(false)
    const [isNickNameValid, setIsNickNameValid] = useState(false)

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
        studioMainImageFile: null,
        studioLogoImageFile: null,
        studioGalleryImageFiles: [],
        studioMainImageUrl: '',
        studioLogoImageUrl: '',
        studioGalleryImageUrls: [],
        studioMainImageName: '',
        studioLogoImageName: '',
        studioGalleryImageNames: [],
    })

    const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(null)

    const [previewMainImage, setPreviewMainImage] = useState<string | null>(null)
    const [previewLogoImage, setPreviewLogoImage] = useState<string | null>(null)
    const [previewGalleryImages, setPreviewGalleryImages] = useState<string[]>([])

    const checkUserName = async () => {
        if (!userInfo.userName.trim()) {
            setUserNameCheckMsg('아이디를 입력해주세요.')
            return
        }

        const { data } = await api.get('/auth/signup/user/checkusername', {
            params: { userName: userInfo.userName },
        })

        setUserNameCheckMsg(data.msg)
        setIsUserNameValid(data.data === true)
    }

    const checkNickName = async () => {
        if (!userInfo.nickName.trim()) {
            setNickNameCheckMsg('닉네임을 입력해주세요.')
            return
        }

        const { data } = await api.get('/auth/signup/user/checknickname', {
            params: { nickName: userInfo.nickName },
        })

        setNickNameCheckMsg(data.msg)
        setIsNickNameValid(data.data === true)
    }

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        const newUser = { ...userInfo, [name]: value }
        setUserInfo(newUser)

        validateUserField(name as keyof UserInfo, value, newUser)

        if (name === 'userName') {
            setIsUserNameValid(false)
            setUserNameCheckMsg('')
        }
        if (name === 'nickName') {
            setIsNickNameValid(false)
            setNickNameCheckMsg('')
        }

        //setUserInfo((prev) => ({ ...prev, [name]: value }));
    }

    // 🔥 유저 프로필 이미지 처리
    const handleUserImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const previewUrl = URL.createObjectURL(file)
        /*
        const previewUrl = URL.createObjectURL(file)
        setPreviewProfileImage(previewUrl)
        */
        setUserInfo((prev) => ({
            ...prev,
            profileImageFile: file,
            profileImageUrl: previewUrl, // 서버 업로드 전 로컬 미리보기 URL
            profileImageName: file.name, // 파일명 저장
        }))
        setPreviewProfileImage(previewUrl)
    }

    const handleStudioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        // 이미지파일 입력 처리
        if ('files' in e.target && e.target.files) {
            const files = e.target.files
            const file = files[0]
            const previewUrl = URL.createObjectURL(file)

            if (name === 'studioGalleryImages') {
                const fileArray = Array.from(files).slice(0, 5)
                const previewUrls = fileArray.map((file) => URL.createObjectURL(file))
                const fileNames = fileArray.map((file) => file.name) // ✅ 파일명 배열 생성
                const newStudio = {
                    ...studioInfo,
                    studioGalleryImageFiles: fileArray,
                    studioGalleryImageUrls: previewUrls,
                    studioGalleryImageNames: fileNames,
                }
                setStudioInfo(newStudio)
                setPreviewGalleryImages(previewUrls)

                validateStudioField('studioGalleryImageUrls', previewUrls, newStudio)
            } else if (name === 'studioMainImage') {
                const newStudio = {
                    ...studioInfo,
                    studioMainImageFile: file,
                    studioMainImageUrl: previewUrl,
                    studioMainImageName: file.name,
                }
                setStudioInfo(newStudio)
                setPreviewMainImage(previewUrl)
                validateStudioField('studioMainImageUrl', previewUrl, newStudio)
            } else if (name === 'studioLogoImage') {
                const newStudio = {
                    ...studioInfo,
                    studioLogoImageFile: file,
                    studioLogoImageUrl: previewUrl,
                    studioLogoImageName: file.name,
                }
                setStudioInfo(newStudio)
                setPreviewLogoImage(previewUrl)
                validateStudioField('studioLogoImageUrl', previewUrl, newStudio)
            }
            /*
            else {
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
                */
            return
        }
        const newStudio = { ...studioInfo, [name]: value }
        setStudioInfo(newStudio)
        validateStudioField(name as keyof StudioInfo, value, newStudio)
        //setStudioInfo((prev) => ({ ...prev, [name]: value }));
    }

    const handleNext = function () {
        const isValid = validate(userInfo)

        if (!isValid) {
            // 검증 실패 → UserForm에서 ErrorMessage 컴포넌트가 에러 표시함
            return
        }
        if (!isUserNameValid) {
            alert('아이디 중복확인을 해주세요.')
            return
        }

        if (!isNickNameValid) {
            alert('닉네임 중복확인을 해주세요.')
            return
        }
        setStep(2)
    }
    const handlePrev = () => {
        setStep(1)
    }

    const handleSubmit = async () => {
        if (
            !studioInfo.studioMainImageFile ||
            !studioInfo.studioLogoImageFile ||
            studioInfo.studioGalleryImageFiles.length === 0
        ) {
            alert('이미지 업로드가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.')
            return
        }

        const payload = {
            ...userInfo,
            ...studioInfo,
            role: 'SELLER',
        }

        /*
        const { studioMainImageUrl, studioLogoImageUrl, studioGalleryImageUrls } = studioInfo
        if (!studioMainImageUrl || !studioLogoImageUrl || studioGalleryImageUrls.length === 0) {
            alert('이미지 업로드가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.')
            return
        }
        
    
        */
        const formData = new FormData()

        // 🔥 1) request(JSON) 추가
        formData.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }))

        // 🔥 2) 파일 추가
        if (userInfo.profileImageFile) {
            formData.append('profileImage', userInfo.profileImageFile)
        }

        if (studioInfo.studioMainImageFile) {
            formData.append('studioMainImage', studioInfo.studioMainImageFile)
        }

        if (studioInfo.studioLogoImageFile) {
            formData.append('studioLogoImage', studioInfo.studioLogoImageFile)
        }

        studioInfo.studioGalleryImageFiles.forEach((file) => {
            formData.append('studioGalleryImages', file)
        })

        // ✅ 여기에서 콘솔로 확인
        console.log('회원가입 요청 payload:', [...formData.entries()])

        try {
            const response = await api.post('/auth/signup/seller', formData)

            alert('회원가입 완료! 로그인을 해주세요')
            router.push('/')
        } catch (error) {
            console.error('회원가입 실패:', error)
            alert('회원가입 실패')
        }
    }

    return (
        <section className="signup-container">
            {step === 1 && (
                <UserForm
                    userInfo={userInfo}
                    onChange={handleUserChange}
                    onNext={handleNext}
                    onImagePreview={handleUserImagePreview}
                    previewProfileImage={previewProfileImage}
                    setUserInfo={setUserInfo}
                    setPreviewProfileImage={setPreviewProfileImage}
                    errors={errors}
                    validateField={validateUserField}
                    checkUserName={checkUserName}
                    checkNickName={checkNickName}
                    userNameCheckMsg={userNameCheckMsg}
                    nickNameCheckMsg={nickNameCheckMsg}
                    isUserNameValid={isUserNameValid}
                    isNickNameValid={isNickNameValid}
                />
            )}
            {step === 2 && (
                <StudioForm
                    studioInfo={studioInfo}
                    onChange={handleStudioChange}
                    onSubmit={handleSubmit}
                    onPrev={handlePrev}
                    setStudioInfo={setStudioInfo}
                    previewMainImage={previewMainImage}
                    previewLogoImage={previewLogoImage}
                    previewGalleryImages={previewGalleryImages}
                    errors={studioErrors}
                    validateField={validateStudioField}
                />
            )}
        </section>
    )
}
