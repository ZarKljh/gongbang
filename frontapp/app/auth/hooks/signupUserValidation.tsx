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

    /** ⭐ 단일 필드를 검증하는 공통 함수 */
    const validateSingleField = (name: keyof SignupUser, value: string, user?: SignupUser): string => {
        let error = ''

        /** --------------------------- userName --------------------------- */
        if (name === 'userName') {
            if (!value.trim()) error = '아이디를 입력해주세요'
            else if (value.length < 4 || value.length > 20) error = '아이디는 4~20자 이내여야 합니다.'
            else if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value)) error = '아이디에는 한글을 사용할 수 없습니다.'
            else if (!/^[A-Za-z0-9]+$/.test(value)) error = '아이디는 영문과 숫자만 사용할 수 있습니다.'
        } else if (name === 'password') {

        /** --------------------------- password --------------------------- */
            if (!value.trim()) error = '비밀번호를 입력해주세요.'
            else if (value.length < 3) error = '비밀번호는 최소 3자 이상이어야 합니다.'
            else if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value)) error = '비밀번호에는 한글을 사용할 수 없습니다.'
            else if ((value.match(/[A-Za-z]/g) || []).length < 2)
                error = '비밀번호에는 영문이 최소 2글자 이상 포함되어야 합니다.'
            else if (!/[^A-Za-z0-9]/.test(value)) error = '비밀번호에는 특수문자를 1개 이상 포함해야 합니다.'
        } else if (name === 'confirmPassword') {

        /** --------------------------- confirmPassword --------------------------- */
            if (!value.trim()) error = '비밀번호 확인을 입력해주세요.'
            else if (user && value !== user.password) error = '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
        } else if (name === 'nickName') {

        /** --------------------------- nickName --------------------------- */
            if (!value.trim()) error = '닉네임을 입력해주세요.'
            else if (value.length < 2 || value.length > 20) error = '닉네임은 2~20자 이내여야 합니다.'
            else if (!/^[A-Za-z0-9가-힣]+$/.test(value)) error = '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.'
        } else if (name === 'email') {

        /** --------------------------- email --------------------------- */
            if (!value.trim()) error = '이메일을 입력해주세요.'
            else if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value)) error = '이메일에는 한글을 사용할 수 없습니다.'
            else {
                const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
                if (!emailRegex.test(value)) error = '올바른 이메일 형식이 아닙니다.'
            }
        } else if (name === 'mobilePhone') {

        /** --------------------------- mobilePhone --------------------------- */
            if (!value.trim()) error = '연락처를 입력해주세요.'
            else if (!/^[0-9]+$/.test(value)) error = '연락처에는 숫자만 들어가야합니다.'
            else {
                const numeric = value.replace(/[^0-9]/g, '')
                if (numeric.length !== 10 && numeric.length !== 11)
                    error = '연락처는 10자리 또는 11자리 숫자여야 합니다.'
            }
        }

        return error
    }

    /** 🔥 실시간 개별 검증 */
    const validateField = (name: keyof SignupUser, value: string, user?: SignupUser) => {
        const error = validateSingleField(name, value, user)

        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }))
    }

    /** 🔥 전체 검증 (버튼 클릭 시 실행) */
    const validate = (user: SignupUser): boolean => {
        const newErrors: SignupErrors = {}

        for (const key in user) {
            const field = key as keyof SignupUser
            newErrors[field] = validateSingleField(field, user[field], user)
        }

        setErrors(newErrors)

        return Object.values(newErrors).every((msg) => !msg)
    }

    return { errors, validate, validateField }
}
