import { useState } from 'react'
import { StudioInfo } from '@/app/auth/signup/seller/types'

interface StudioErrors {
    categoryId?: string
    studioName?: string
    studioDescription?: string
    studioMobile?: string
    studioOfficeTell?: string
    studioFax?: string
    studioEmail?: string
    studioBusinessNumber?: string
    studioAddPostNumber?: string
    studioAddMain?: string
    studioAddDetail?: string
    studioMainImageUrl?: string
    studioLogoImageUrl?: string
    studioGalleryImageUrls?: string
}

export function signupSellerValidation() {
    const [errors, setErrors] = useState<StudioErrors>({})

    const validateSingleField = (name: keyof StudioInfo, value: any, studio?: StudioInfo): string => {
        let error = ''

        /** ---------------- categoryId ---------------- */
        if (name === 'categoryId') {
            if (!value) error = '공방 카테고리를 선택해주세요.'
        } else if (name === 'studioBusinessNumber') {
            /** ---------------- studioBusinessNumber ---------------- */
            if (!value.trim()) error = '사업자 번호를 입력해주세요.'
            else {
                const n = value.replace(/[^0-9]/g, '')
                if (n.length !== 10) error = '사업자번호는 숫자 10자리여야 합니다.'
            }
        } else if (name === 'studioName') {
            /** ---------------- studioName ---------------- */
            if (!value.trim()) error = '공방 이름을 입력해주세요.'
            else if (value.length < 2) error = '공방 이름은 2자 이상이어야 합니다.'
        } else if (name === 'studioDescription') {
            /** ---------------- studioDescription ---------------- */
            if (!value.trim()) error = '공방 설명을 입력해주세요.'
            else if (value.length < 5) error = '설명은 최소 5자 이상이어야 합니다.'
        } else if (name === 'studioMobile') {
            /** ---------------- studioMobile ---------------- */
            if (value.trim()) {
                const n = value.replace(/[^0-9]/g, '')
                if (n.length < 10 || n.length > 11) error = '전화번호는 10~11자리 숫자만 입력 가능합니다.'
            }
        } else if (name === 'studioOfficeTell') {
            /** ---------------- studioOfficeTell ---------------- */
            if (value.trim()) {
                const n = value.replace(/[^0-9]/g, '')
                if (n.length < 9 || n.length > 11) error = '사무실 전화번호는 9~11자리 숫자만 입력 가능합니다.'
            }
        } else if (name === 'studioFax') {
            /** ---------------- studioFax ---------------- */
            if (value.trim()) {
                const n = value.replace(/[^0-9]/g, '')
                if (n.length < 9 || n.length > 11) error = 'FAX 번호는 9~11자리 숫자만 입력 가능합니다.'
            }
        } else if (name === 'studioEmail') {
            /** ---------------- studioEmail ---------------- */
            if (!value.trim()) error = '이메일을 입력해주세요.'
            else {
                const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
                if (!emailRegex.test(value)) error = '올바른 이메일 형식이 아닙니다.'
            }
        } else if (name === 'studioAddPostNumber') {
            /** ---------------- studioAddPostNumber ---------------- */
            if (!value.trim()) error = '우편번호를 입력해주세요.'
        } else if (name === 'studioAddMain') {
            /** ---------------- studioAddMain ---------------- */
            if (!value.trim()) error = '기본 주소를 입력해주세요.'
        } else if (name === 'studioMainImageUrl') {
            /** ---------------- studioMainImageUrl ---------------- */
            if (!value) error = '대표 이미지를 업로드해주세요.'
        } else if (name === 'studioLogoImageUrl') {
            /** ---------------- studioLogoImageUrl ---------------- */
            if (!value) error = '로고 이미지를 업로드해주세요.'
        } else if (name === 'studioGalleryImageUrls') {
            /** ---------------- studioGalleryImageUrls ---------------- */
            const count = studio?.studioGalleryImageUrls.length || 0

            if (count > 5) error = '매장 사진은 최대 5장까지 업로드할 수 있습니다.'
            else if (count < 1) error = '가입 심사를 위해 매장사진을 1장 이상 업로드해주세요'
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
    const validate = (studio: StudioInfo): boolean => {
        const newErrors: StudioErrors = {}

        for (const key in studio) {
            const field = key as keyof StudioInfo
            newErrors[field] = validateSingleField(field, studio[field], studio)
        }

        setErrors(newErrors)

        return Object.values(newErrors).every((e) => !e)
    }

    return { errors, validate, validateField }
}
