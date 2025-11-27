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

    const validate = (user: LoginUser): boolean => {
        const newErrors: LoginErrors = {}

        if (!user.userName.trim()) {
            newErrors.userName = '아이디를 입력해주세요'
        } else if (user.userName.length < 4 || user.userName.length > 20) {
            newErrors.userName = '아이디는 4~20자 이내여야 합니다.'
        }

        if (!user.password.trim()) {
            newErrors.password = '비밀번호를 입력해주세요'
        } else if (user.password.length < 4) {
            newErrors.password = '비밀번호는 4자 이상이여야 합니다.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    return { errors, validate }
}
