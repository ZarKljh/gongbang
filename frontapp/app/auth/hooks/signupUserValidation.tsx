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

    const validate = (user: SignupUser): boolean => {
        const newErrors: SignupErrors = {}

        if (!user.userName.trim()) {
            newErrors.userName = '아이디를 입력해주세요'
        } else if (user.userName.length < 8 || user.userName.length > 20) {
            newErrors.userName = '아이디는 8~20자 이내여야 합니다.'
        } else if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(user.userName)) {
            newErrors.userName = '아이디에는 한글을 사용할 수 없습니다.'
        } else if (!/^[A-Za-z0-9]+$/.test(user.userName)) {
            newErrors.userName = '아이디는 영문과 숫자만 사용할 수 있습니다.'
        } else {
            const onlyLetters = user.userName.match(/[A-Za-z]/g) || [] // 영문만 추출
            if (onlyLetters.length < 8) {
                newErrors.userName = '아이디에는 영문이 최소 8글자 이상 포함되어야 합니다.'
            }
        }

        if (!user.password) {
            newErrors.password = '비밀번호를 입력해주세요.'
        } else if (user.password.length < 8) {
            newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.'
        } else if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(user.password)) {
            newErrors.password = '비밀번호에는 한글을 사용할 수 없습니다.'
        } else {
            // 영문 개수 검사
            const letters = user.password.match(/[A-Za-z]/g) || []
            if (letters.length < 8) {
                newErrors.password = '비밀번호에는 영문이 최소 8글자 이상 포함되어야 합니다.'
            }

            // 특수문자 1개 이상 검사
            const hasSpecialChar = /[^A-Za-z0-9]/.test(user.password)
            if (!hasSpecialChar) {
                newErrors.password = '비밀번호에는 특수문자를 1개 이상 포함해야 합니다.'
            }
        }

        // ----- 닉네임 형식 검증 -----
        if (!user.nickName.trim()) {
            newErrors.nickName = '닉네임을 입력해주세요.'
        } else if (user.nickName.length < 2 || user.nickName.length > 20) {
            newErrors.nickName = '닉네임은 2~20자 이내여야 합니다.'
        } else if (!/^[A-Za-z0-9가-힣]+$/.test(user.nickName)) {
            newErrors.nickName = '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.'
        }

        // ---------------------- 이메일 검증 추가됨 ----------------------
        if (!user.email.trim()) {
            newErrors.email = '이메일을 입력해주세요.'
        } else if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(user.email)) {
            newErrors.email = '이메일에는 한글을 사용할 수 없습니다.'
        } else {
            // 이메일 형식 검사
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
            if (!emailRegex.test(user.email)) {
                newErrors.email = '올바른 이메일 형식이 아닙니다.'
            }
        }

        // ----- 연락처 검증 -----
        if (!user.mobilePhone.trim()) {
            newErrors.mobilePhone = '연락처를 입력해주세요.'
        } else {
            // 자동으로 숫자만 추출
            const numericPhone = user.mobilePhone.replace(/[^0-9]/g, '')

            if (numericPhone.length !== 10 && numericPhone.length !== 11) {
                newErrors.mobilePhone = '연락처는 10자리 또는 11자리 숫자여야 합니다.'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    return { errors, validate }
}
