'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { checkLoginStatus } from './checkLogin'

export default function AuthNav() {
    const [isLoggedIn, setIsLoggedIn] = useState(null)

    useEffect(() => {
        const fetchLoginStatus = async () => {
            const status = await checkLoginStatus()
            setIsLoggedIn(status)
        }
        fetchLoginStatus()
    }, [])

    if (isLoggedIn === null) return null

    return (
        <>
            {isLoggedIn ? (
                <Link href="/auth/logout">!!!로그아웃!!!</Link>
            ) : (
                <>
                    <Link href="/auth/login">!!!로그인!!!</Link>
                    <Link href="/auth/signup">!!!회원가입!!!</Link>
                </>
            )}
        </>
    )
}
