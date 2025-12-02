// 📁 hooks/useStudioTabValidation.ts
import { useState } from 'react'
import { StudioInfo } from '@/app/auth/signup/seller/types'

interface StudioErrors {
    studioName?: string
    studioDescription?: string
    studioMobile?: string
    studioOfficeTell?: string
    studioFax?: string
    studioEmail?: string
    studioAddPostNumber?: string
    studioAddMain?: string
    studioMainImageUrl?: string
    studioLogoImageUrl?: string
    studioGalleryImageUrls?: string
}

export function useStudioTabValidation() {
    const [errors, setErrors] = useState<StudioErrors>({})

    /** 🔥 단일 필드 검증 */
    const validateFieldSingle = (field: keyof StudioInfo, value: any, studio: StudioInfo): string => {
        let error = ''

        switch (field) {
            case 'studioName':
                if (!value.trim()) error = '공방 이름을 입력해주세요.'
                else if (value.trim().length < 2) error = '공방 이름은 2글자 이상이어야 합니다.'
                break

            case 'studioDescription':
                if (!value.trim()) error = '공방 설명을 입력해주세요.'
                else if (value.trim().length < 5) error = '설명은 5자 이상이어야 합니다.'
                break

            case 'studioMobile':
                if (value.trim()) {
                    const n = value.replace(/[^0-9]/g, '')
                    if (n.length < 10 || n.length > 11) error = '전화번호는 10~11자리 숫자여야 합니다.'
                }
                break

            case 'studioOfficeTell':
            case 'studioFax':
                if (value.trim()) {
                    const n = value.replace(/[^0-9]/g, '')
                    if (n.length < 9 || n.length > 11) error = '전화번호는 9~11자리 숫자여야 합니다.'
                }
                break

            case 'studioEmail':
                if (!value.trim()) error = '이메일을 입력해주세요.'
                else {
                    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
                    if (!emailRegex.test(value)) error = '유효한 이메일 형식이 아닙니다.'
                }
                break

            case 'studioAddPostNumber':
                if (!value.trim()) error = '우편번호를 입력해주세요.'
                break

            case 'studioAddMain':
                if (!value.trim()) error = '기본주소를 입력해주세요.'
                break

            // 이미지 검증은 전체 검사에서 실행함
        }

        return error
    }

    /** 🔥 실시간 검증 */
    const validateField = (field: keyof StudioInfo, value: any, studio: StudioInfo) => {
        const error = validateFieldSingle(field, value, studio)

        setErrors((prev) => ({
            ...prev,
            [field]: error,
        }))
    }

    /** 🔥 저장 시 전체 검증 */
    const validateAll = (studio: StudioInfo): boolean => {
        const newErrors: StudioErrors = {}

        for (const key in studio) {
            const field = key as keyof StudioInfo
            newErrors[field] = validateFieldSingle(field, studio[field], studio)
        }

        // 이미지 필수 검증
        if (!studio.studioMainImageUrl) {
            newErrors.studioMainImageUrl = '대표 이미지는 최소 1장이 필요합니다.'
        }
        if (!studio.studioLogoImageUrl) {
            newErrors.studioLogoImageUrl = '로고 이미지는 최소 1장이 필요합니다.'
        }
        if (!studio.studioGalleryImageUrls || studio.studioGalleryImageUrls.length === 0) {
            newErrors.studioGalleryImageUrls = '공방 갤러리 이미지는 최소 1장 필요합니다.'
        }

        setErrors(newErrors)

        return Object.values(newErrors).every((v) => !v)
    }

    return { errors, validateField, validateAll }
}
