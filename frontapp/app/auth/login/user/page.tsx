'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import './login_user.css'
import { loginUserValidation } from '@/app/auth/hooks/loginUserValidation'
import ErrorMessage from '@/app/auth/common/errorMessage'
import axios from 'axios'
import { api } from '@/app/utils/api'

export default function LoginUser() {
    const router = useRouter()

    const [user, setUser] = useState({
        userName: '',
        password: '',
        role: 'USER',
    })

    const { errors, validate, validateField } = loginUserValidation()

    const handleSubmit = async (e) => {
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

    //로그아웃을 위한 메소드
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout') // baseURL 자동 적용

            alert('로그아웃 성공하였습니다.')
            router.push('/')
        } catch (error) {
            alert('로그아웃에 실패하였습니다.')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setUser({ ...user, [name]: value })
        //console.log({...article, [name]: value});
        // 🔥 실시간 검증 실행
        validateField(name, value)
    }

    return (
        <>
            <section className="login-container">
                <h2 className="login-title">로그인</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">아이디</label>
                        <input type="text" name="userName" className="form-input" onChange={handleChange}></input>
                    </div>
                    <ErrorMessage message={errors.userName} />
                    <div className="form-group">
                        <label className="form-label">패스워드</label>
                        <input type="password" name="password" className="form-input" onChange={handleChange}></input>
                    </div>
                    <ErrorMessage message={errors.password} />
                    <div className="button-group">
                        <input type="submit" value="로그인" className="btn btn-primary" />
                        {/* <button type="submit">등록</button> */}
                    </div>
                </form>
            </section>
        </>
    )
}
