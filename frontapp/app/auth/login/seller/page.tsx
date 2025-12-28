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

    /*
    const handleChange = (e) => {
        const { name, value } = e.target
        setSeller({ ...seller, [name]: value })
        //console.log({...article, [name]: value});
        validateField(name, value)
    }
    */
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const { name, value } = e.target

        // 💡 별칭 없이, name을 직접 'typeof seller'의 키로 단언
        const fieldName = name as keyof typeof seller

        setSeller({ ...seller, [fieldName]: value })
        //validateField(fieldName, value)
        if (name === 'userName' || name === 'password') {
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
                    </div>
                    <div className="errorMessage-area">
                        <ErrorMessage message={errors.userName} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">패스워드</label>
                        <input type="password" name="password" className="form-input" onChange={handleChange}></input>
                    </div>
                    <div className="errorMessage-area">
                        <ErrorMessage message={errors.password} />
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
