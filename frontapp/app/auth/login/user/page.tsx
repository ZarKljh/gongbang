'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import './login_user.css'
import { loginUserValidation } from '@/app/auth/hooks/loginUserValidation'
import ErrorMessage from '@/app/auth/common/errorMessage'

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

        const response = await fetch(`http://localhost:8090/api/v1/auth/login/user`, {
            method: 'POST',
            credentials: 'include', //인증정보를 함께 보내는 경우, 쿠키와 같은 것들포함
            //서버에게 주고받는 데이터를 json형태로 하겠다고 선언하는 것
            headers: {
                'Content-Type': 'application/json',
            },
            //무엇을 json으로 할지 선언한것
            body: JSON.stringify(user),
        })
        if (response.ok) {
            alert('login success')
            router.push(`/`)
        } else {
            alert('login fail')
        }
    }

    //로그아웃을 위한 메소드
    const handleLogout = async () => {
        const response = await fetch('http://localhost:8090/api/v1/auth/logout', {
            method: 'POST',
            credentials: 'include',
        })
        if (response.ok) {
            alert('logout success')
            router.push(`/`)
        } else {
            alert('logout fail')
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
                        <button type="button" className="btn" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </div>
                </form>
            </section>
        </>
    )
}
