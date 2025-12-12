// 📁 app/auth/hooks/addStudioValidation.ts
import { useState } from 'react'
import { StudioInfo } from '@/app/auth/signup/seller/types'

interface StudioErrors {
    categoryId?: string
    studioBusinessNumber?: string
    studioName?: string
    studioDescription?: string
    studioMobile?: string
    studioOfficeTell?: string
    studioFax?: string
    studioEmail?: string
    studioAddPostNumber?: string
    studioAddMain?: string
    studioAddDetail?: string
    studioMainImageUrl?: string
    studioLogoImageUrl?: string
    studioGalleryImageUrls?: string
    studioMainImageFile?: string // File 객체이지만 순회를 위해 추가 (오류 메시지는 string)
    studioLogoImageFile?: string // File 객체이지만 순회를 위해 추가
    studioGalleryImageFiles?: string // File[] 객체이지만 순회를 위해 추가
    studioMainImageName?: string
    studioLogoImageName?: string
    studioGalleryImageNames?: string
}

export function useStudioAddValidation() {
    const [errors, setErrors] = useState<StudioErrors>({})

    /** 🔥 단일 필드 검증 */
    const validateSingleField = (name: keyof StudioInfo, value: any, studio?: StudioInfo): string => {
        let error = ''

        // 카테고리
        if (name === 'categoryId') {
            if (!value) error = '카테고리를 선택해주세요.'
        }
        // 사업자번호
        else if (name === 'studioBusinessNumber') {
            if (!value?.trim()) error = '사업자번호를 입력해주세요.'
            else {
                const n = value.replace(/[^0-9]/g, '')
                if (n.length !== 10) error = '사업자번호는 숫자 10자리여야 합니다.'
            }
        }
        // 공방 이름
        else if (name === 'studioName') {
            if (!value?.trim()) error = '공방 이름을 입력해주세요.'
            else if (value.length < 2) error = '공방 이름은 2자 이상이어야 합니다.'
        }
        // 설명
        else if (name === 'studioDescription') {
            if (!value?.trim()) error = '공방 설명을 입력해주세요.'
            else if (value.length < 5) error = '설명은 5자 이상이어야 합니다.'
        }
        // 대표번호
        else if (name === 'studioMobile') {
            if (!value?.trim()) error = '대표번호를 입력해주세요.'
            else {
                const n = value.replace(/[^0-9]/g, '')
                if (n.length < 10 || n.length > 11) error = '전화번호는 10~11자리 숫자여야 합니다.'
            }
        }
        // 사무실/팩스
        else if (name === 'studioOfficeTell' || name === 'studioFax') {
            if (value?.trim()) {
                const n = value.replace(/[^0-9]/g, '')
                if (n.length < 9 || n.length > 11) error = '전화번호는 9~11자리 숫자여야 합니다.'
            }
        }
        // 이메일
        else if (name === 'studioEmail') {
            if (!value?.trim()) error = '이메일을 입력해주세요.'
            else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(value)) error = '올바른 이메일 형식이 아닙니다.'
            }
        }
        // 주소
        else if (name === 'studioAddPostNumber') {
            if (!value?.trim()) error = '우편번호를 입력해주세요.'
        } else if (name === 'studioAddMain') {
            if (!value?.trim()) error = '기본주소를 입력해주세요.'
        } else if (name === 'studioAddDetail') {
            if (!value?.trim()) error = '상세주소를 입력해주세요.'
        }

        // 대표 이미지
        else if (name === 'studioMainImageUrl') {
            if (!value) error = '대표 이미지를 업로드해주세요.'
        }
        // 로고 이미지
        else if (name === 'studioLogoImageUrl') {
            if (!value) error = '로고 이미지를 업로드해주세요.'
        }
        // 갤러리 이미지
        else if (name === 'studioGalleryImageUrls') {
            const count = Array.isArray(value) ? value.length : 0
            if (count < 1) error = '갤러리 이미지는 최소 1장 필요합니다.'
            if (count > 5) error = '갤러리 이미지는 최대 5장까지 업로드 가능합니다.'
        }

        return error
    }

    /** 🔥 실시간 검증 */
    const validateField = (name: keyof StudioInfo, value: any, studio?: StudioInfo) => {
        const error = validateSingleField(name, value, studio)

        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }))
    }

    /** 🔥 전체 검증 */
    const validateAll = (studio: StudioInfo): boolean => {
        const newErrors: StudioErrors = {}

        Object.keys(studio).forEach((key) => {
            const f = key as keyof StudioInfo
            newErrors[f] = validateSingleField(f, studio[f], studio)
        })

        setErrors(newErrors)

        return Object.values(newErrors).every((e) => !e)
    }

    return { errors, validateField, validateAll }
}
