'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import './login_user.css'
import { loginUserValidation } from '@/app/auth/hooks/loginUserValidation'
import ErrorMessage from '@/app/auth/common/errorMessage'
import { api } from '@/app/utils/api'

type FormSubmitEvent = React.FormEvent<HTMLFormElement>

export default function LoginUser() {
    const router = useRouter()

    const [user, setUser] = useState({
        userName: '',
        password: '',
        role: 'USER',
    })

    const { errors, validate, validateField } = loginUserValidation()

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault()

        //아이디와 password검증
        const isValid = validate(user)
        if (!isValid) {
            return
        }

        try {
            // ✔ baseURL 자동 적용됨
            const response = await api.post('/auth/login/user', user)

            alert('로그인성공하였습니다')
            router.push('/')
        } catch (error) {
            alert('로그인에 실패하였습니다. 아이디 혹은 비밀번호를 확인해주세요')
        }
    }

    /*
    const handleChange = (e) => {
        const { name, value } = e.target
        setUser({ ...user, [name]: value })
        //console.log({...article, [name]: value});
        // 🔥 실시간 검증 실행
        validateField(name, value)
    }
    */

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        // ✨ 타입 명시
        const { name, value } = e.target

        // 1. user 상태 업데이트를 위해 name을 user 상태의 키로 단언
        const fieldName = name as keyof typeof user
        setUser({ ...user, [fieldName]: value })

        // 2. validateField 호출 시, 훅이 기대하는 필드('userName', 'password')만 검증하고 타입 단언 적용
        if (name === 'userName' || name === 'password') {
            // validateField는 keyof LoginUser (즉, 'userName' | 'password') 타입을 기대함
            validateField(name as 'userName' | 'password', value)
        }
    }

    return (
        <>
            <section className="login-container">
                <h2 className="login-title">로그인</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">아이디</label>
                        <input type="text" name="userName" className="form-input" onChange={handleChange}></input>
                        <div className="errorMessage-area">
                            <ErrorMessage message={errors.userName} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">패스워드</label>
                        <input type="password" name="password" className="form-input" onChange={handleChange}></input>
                        <div className="errorMessage-area">
                            <ErrorMessage message={errors.password} />
                        </div>
                    </div>
                    <div className="button-group">
                        <input type="submit" value="로그인" className="btn btn-primary" />
                        {/* <button type="submit">등록</button> */}
                    </div>
                </form>
            </section>
        </>
    )
}
