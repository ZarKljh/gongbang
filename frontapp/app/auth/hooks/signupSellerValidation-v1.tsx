import { useState } from 'react'

interface StudioInfo {
    categoryId: string
    studioName: string
    studioDescription: string
    studioMobile: string
    studioOfficeTell: string
    studioFax: string
    studioEmail: string
    studioBusinessNumber: string
    studioAddPostNumber: string
    studioAddMain: string
    studioAddDetail: string
    studioMainImageUrl: string
    studioLogoImageUrl: string
    studioGalleryImageUrls: string[]
    studioMainImageName: string
    studioLogoImageName: string
    studioGalleryImageNames: string[]
}

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

    const validate = (studio: StudioInfo): boolean => {
        const newErrors: StudioErrors = {}

        // 🔥 카테고리
        if (!studio.categoryId) {
            newErrors.categoryId = '공방 카테고리를 선택해주세요.'
        }

        // 🔥 사업자번호
        if (!studio.studioBusinessNumber.trim()) {
            newErrors.studioBusinessNumber = '사업자 번호를 입력해주세요.'
        } else {
            const numericBiz = studio.studioBusinessNumber.replace(/[^0-9]/g, '')
            if (numericBiz.length !== 10) {
                newErrors.studioBusinessNumber = '사업자번호는 숫자 10자리여야 합니다.'
            }
        }

        // 🔥 공방 이름
        if (!studio.studioName.trim()) {
            newErrors.studioName = '공방 이름을 입력해주세요.'
        } else if (studio.studioName.length < 2) {
            newErrors.studioName = '공방 이름은 2자 이상이어야 합니다.'
        }

        // 🔥 공방 설명
        if (!studio.studioDescription.trim()) {
            newErrors.studioDescription = '공방 설명을 입력해주세요.'
        } else if (studio.studioDescription.length < 5) {
            newErrors.studioDescription = '설명은 최소 5자 이상이어야 합니다.'
        }

        // 🔥 공방 대표 전화 (선택이지만 형식은 체크)
        if (studio.studioMobile.trim()) {
            const num = studio.studioMobile.replace(/[^0-9]/g, '')
            if (num.length < 10 || num.length > 11) {
                newErrors.studioMobile = '전화번호는 10~11자리 숫자만 입력 가능합니다.'
            }
        }

        // 🔥 사무실 전화 (선택 입력)
        if (studio.studioOfficeTell.trim()) {
            const num = studio.studioOfficeTell.replace(/[^0-9]/g, '')
            if (num.length < 9 || num.length > 11) {
                newErrors.studioOfficeTell = '사무실 전화번호는 9~11자리 숫자만 입력 가능합니다.'
            }
        }

        // 🔥 FAX (선택 입력)
        if (studio.studioFax.trim()) {
            const num = studio.studioFax.replace(/[^0-9]/g, '')
            if (num.length < 9 || num.length > 11) {
                newErrors.studioFax = 'FAX 번호는 9~11자리 숫자만 입력 가능합니다.'
            }
        }

        // 🔥 이메일
        if (!studio.studioEmail.trim()) {
            newErrors.studioEmail = '이메일을 입력해주세요.'
        } else {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
            if (!emailRegex.test(studio.studioEmail)) {
                newErrors.studioEmail = '올바른 이메일 형식이 아닙니다.'
            }
        }

        // 🔥 주소
        if (!studio.studioAddPostNumber.trim()) {
            newErrors.studioAddPostNumber = '우편번호를 입력해주세요.'
        }
        if (!studio.studioAddMain.trim()) {
            newErrors.studioAddMain = '기본 주소를 입력해주세요.'
        }

        // 🔥 상세주소는 선택

        // 🔥 대표 이미지 필수
        if (!studio.studioMainImageUrl) {
            newErrors.studioMainImageUrl = '대표 이미지를 업로드해주세요.'
        }

        // 🔥 로고는 선택

        // 🔥 갤러리 이미지 (최대 5장)
        if (studio.studioGalleryImageUrls.length > 5) {
            newErrors.studioGalleryImageUrls = '매장 사진은 최대 5장까지 업로드할 수 있습니다.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    return { errors, validate }
}
