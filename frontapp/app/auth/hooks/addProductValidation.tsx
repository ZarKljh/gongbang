'use client'

import { useState } from 'react'

interface ProductForm {
    name: string
    slug: string
    categoryId: string
    subcategoryId?: string
    subtitle?: string
    basePrice: string
    stockQuantity: string
    backorderable: string
    active: string
    status: string

    productMainImageUrl?: string | null
    productGalleryImageUrls?: any[]
}

interface ProductErrors {
    name?: string
    slug?: string
    categoryId?: string
    subtitle?: string
    basePrice?: string
    stockQuantity?: string
    backorderable?: string
    active?: string
    status?: string
    productMainImageUrl?: string
    productGalleryImageUrls?: string
}

export function addProductValidation() {
    const [errors, setErrors] = useState<ProductErrors>({})

    /** -------------------------------
     * ⭐ 단일 필드 검증 함수
     -------------------------------- */
    const validateSingleField = (name: keyof ProductForm, value: any, form: ProductForm): string => {
        let error = ''
        const str = String(value ?? '').trim()

        /** ----------------------- name ----------------------- */
        if (name === 'name') {
            if (!value.trim()) error = '상품명을 입력해주세요.'
            else if (value.length < 4) error = '상품명은 4글자 이상이어야 합니다.'
            else if (!/[가-힣A-Za-z]/.test(value)) error = '상품명에는 한글 또는 영문이 최소 1글자 포함되어야 합니다.'
            // 공백, 특수문자 허용
        }

        /** ----------------------- slug ----------------------- */
        if (name === 'slug') {
            if (!value.trim()) error = 'Slug는 필수 입력값입니다.'
            else if (value.length < 4) error = 'Slug는 4글자 이상이어야 합니다.'
            else if (!/^[A-Za-z0-9-_]+$/.test(value))
                error = 'Slug는 영문, 숫자, 하이픈(-), 언더바(_)만 사용할 수 있습니다.'
            // DB 중복검사는 백엔드 요청에서 처리
        }

        /** ----------------------- categoryId ----------------------- */
        if (name === 'categoryId') {
            if (!str.trim()) error = '카테고리를 선택해주세요.'
        }

        /** ----------------------- subtitle ----------------------- */
        if (name === 'subtitle') {
            if (value && /^[^A-Za-z0-9가-힣]+$/.test(value)) error = '부제목은 특수문자만 입력할 수 없습니다.'
        }

        /** ----------------------- basePrice ----------------------- */
        if (name === 'basePrice') {
            if (!str.trim()) error = '가격을 입력해주세요.'
            else if (!/^[0-9]+$/.test(value)) error = '가격은 숫자만 입력 가능합니다.'
            else if (str.startsWith('0') && value !== '0') error = '앞자리 0은 자동 제거해주세요.'
            else if (Number(value) <= 0) error = '가격은 0보다 커야 합니다.'
        }

        /** ----------------------- stockQuantity ----------------------- */
        if (name === 'stockQuantity') {
            if (!str.trim()) error = '재고 수량을 입력해주세요.'
            else if (!/^[0-9]+$/.test(value)) error = '재고는 숫자만 입력 가능합니다.'
            else if (Number(value) < 0) error = '재고는 0 이상이어야 합니다.'
        }

        /** ----------------------- backorderable ----------------------- */
        if (name === 'backorderable') {
            if (value !== 'true' && value !== 'false') error = '백오더 가능 여부를 선택해주세요.'
        }

        /** ----------------------- active ----------------------- */
        if (name === 'active') {
            if (value !== 'true' && value !== 'false') error = '상품 활성 여부를 선택해주세요.'
        }

        /** ----------------------- status ----------------------- */
        /*
        if (name === 'status') {
            if (!['DRAFT', 'PUBLISHED', 'UNPUBLISHED'].includes(value)) error = '상품 상태는 임시저장 또는 판매중 중에서 선택해주세요.'
        }
        */
        /** ----------------------- productMainImageUrl ----------------------- */
        if (name === 'productMainImageUrl') {
            if (!value) error = '대표 이미지는 필수입니다.'
        }

        /** ----------------------- productGalleryImageUrls ----------------------- */
        if (name === 'productGalleryImageUrls') {
            if (Array.isArray(value) && value.length === 0) error = '' // 선택입력이라 에러 없음
        }

        return error
    }

    /** -------------------------------
     * ⭐ 실시간 검증
     -------------------------------- */
    const validateField = (name: keyof ProductForm, value: any, form: ProductForm) => {
        const error = validateSingleField(name, value, form)

        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }))
    }

    /** -------------------------------
     * ⭐ 전체 검증
     -------------------------------- */
    const validateAll = (form: ProductForm): boolean => {
        const newErrors: ProductErrors = {}

        Object.keys(form).forEach((key) => {
            const field = key as keyof ProductForm
            newErrors[field] = validateSingleField(field, form[field], form)
        })

        setErrors(newErrors)

        return Object.values(newErrors).every((msg) => !msg)
    }

    return { errors, validateField, validateAll }
}
