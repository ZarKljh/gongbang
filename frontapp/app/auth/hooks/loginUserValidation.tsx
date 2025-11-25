import { useState } from 'react'

interface LoginUser {
    userName: string
    password: string
}

interface LoginErrors {
    userName?: string
    password?: string
}

export function loginUserValidation() {
    const [errors, setErrors] = useState<LoginErrors>({})

    // ⭐ 공통 검증 함수 (중복 ZERO)
    const validateSingleField = (name: keyof LoginUser, value: string): string => {
        let error = ''

        if (name === 'userName') {
            if (!value.trim()) error = '아이디를 입력해주세요'
            else if (value.length < 4 || value.length > 20) error = '아이디는 4~20자 이내여야 합니다.'
        }

        if (name === 'password') {
            if (!value.trim()) error = '비밀번호를 입력해주세요'
            else if (value.length < 4) error = '비밀번호는 4자 이상이여야 합니다.'
        }

        return error
    }

    // 🔥 실시간 개별 필드 검증
    const validateField = (name: keyof LoginUser, value: string) => {
        const error = validateSingleField(name, value)

        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }))
    }

    // 🔥 버튼 클릭 시 전체 검증
    const validate = (user: LoginUser): boolean => {
        const newErrors: LoginErrors = {}

        newErrors.userName = validateSingleField('userName', user.userName)
        newErrors.password = validateSingleField('password', user.password)

        setErrors(newErrors)

        return Object.values(newErrors).every((err) => !err)
    }

    return { errors, validate, validateField }
}
