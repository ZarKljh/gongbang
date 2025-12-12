'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import './login_seller.css'
import { loginUserValidation } from '@/app/auth/hooks/loginUserValidation'
import ErrorMessage from '@/app/auth/common/errorMessage'
import axios from 'axios'
import { api } from '@/app/utils/api'

// 💡 1. handleSubmit을 위한 타입 선언
type FormSubmitEvent = React.FormEvent<HTMLFormElement>

// 💡 2. handleChange를 위한 타입 선언
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

export default function LoginSeller() {
    const router = useRouter()

    const [seller, setSeller] = useState({
        userName: '',
        password: '',
        role: 'SELLER',
    })

    const { errors, validate, validateField } = loginUserValidation()

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault()

        //아이디와 password검증
        const isValid = validate(seller)
        if (!isValid) {
            return
        }

        try {
            await api.post('/auth/login/seller', seller)

            alert('로그인성공하였습니다')
            router.push('/')
        } catch (error) {
            alert('로그인에 실패하였습니다. 아이디 혹은 비밀번호를 확인해주세요')
        }
    }

    //로그아웃을 위한 메소드
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
            alert('로그아웃 성공하였습니다')
            router.push('/')
        } catch (error) {
            alert('로그아웃에 실패하였습니다.')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setSeller({ ...seller, [name]: value })
        //console.log({...article, [name]: value});
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
