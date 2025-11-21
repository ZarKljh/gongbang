import { useState } from 'react'

interface SignupUser {
    userName: string
    password: string
    confirmPassword: string
    fullName: string
    email: string
    nickName: string
    mobilePhone: string
}

interface SignupErrors {
    userName?: string
    password?: string
    confirmPassword?: string
    fullName?: string
    email?: string
    nickName?: string
    mobilePhone?: string
}

export function signupUserValidation() {
    const [errors, setErrors] = useState<SignupErrors>({})

    // ⭐ 모든 검증의 중심이 되는 단일 함수
    const validateSingleField = (name: keyof SignupUser, value: string, user?: SignupUser): string => {
        switch (name) {
            case 'userName':
                if (!value.trim()) return '아이디를 입력해주세요'
                if (value.length < 4 || value.length > 20) return '아이디는 4~20자 이내여야 합니다.'
                if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value)) return '아이디에는 한글을 사용할 수 없습니다.'
                if (!/^[A-Za-z0-9]+$/.test(value)) return '아이디는 영문과 숫자만 사용할 수 있습니다.'
                return ''

            case 'password':
                if (!value.trim()) return '비밀번호를 입력해주세요.'
                if (value.length < 3) return '비밀번호는 최소 3자 이상이어야 합니다.'
                if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value)) return '비밀번호에는 한글을 사용할 수 없습니다.'
                if ((value.match(/[A-Za-z]/g) || []).length < 2)
                    return '비밀번호에는 영문이 최소 2글자 이상 포함되어야 합니다.'
                if (!/[^A-Za-z0-9]/.test(value)) return '비밀번호에는 특수문자를 1개 이상 포함해야 합니다.'
                return ''

            case 'confirmPassword':
                if (!value.trim()) return '비밀번호 확인을 입력해주세요.'
                if (user && value !== user.password) return '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
                return ''

            case 'nickName':
                if (!value.trim()) return '닉네임을 입력해주세요.'
                if (value.length < 2 || value.length > 20) return '닉네임은 2~20자 이내여야 합니다.'
                if (!/^[A-Za-z0-9가-힣]+$/.test(value)) return '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.'
                return ''

            case 'email':
                if (!value.trim()) return '이메일을 입력해주세요.'
                if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value)) return '이메일에는 한글을 사용할 수 없습니다.'
                const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
                if (!emailRegex.test(value)) return '올바른 이메일 형식이 아닙니다.'
                return ''

            case 'mobilePhone':
                if (!value.trim()) return '연락처를 입력해주세요.'
                const numeric = value.replace(/[^0-9]/g, '')
                if (numeric.length !== 10 && numeric.length !== 11)
                    return '연락처는 10자리 또는 11자리 숫자여야 합니다.'
                return ''

            default:
                return ''
        }
    }

    // 🔥 실시간 개별 검증
    const validateField = (name: keyof SignupUser, value: string, user?: SignupUser) => {
        const error = validateSingleField(name, value, user)

        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }))
    }

    // 🔥 버튼 클릭 시 전체 검증
    const validate = (user: SignupUser): boolean => {
        const newErrors: SignupErrors = {}(Object.keys(user) as (keyof SignupUser)[]).forEach((key) => {
            newErrors[key] = validateSingleField(key, user[key], user)
        })

        setErrors(newErrors)
        return Object.values(newErrors).every((err) => !err) // 에러없으면 true
    }

    return { errors, validate, validateField }
}
