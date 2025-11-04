// auth/common/useCurrentUser.ts
'use client'

import { useEffect, useState } from 'react'

export default function useCurrentUser() {
    const [currentUser, setCurrentUser] = useState<{ userName: string }>({ userName: '' })

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('http://localhost:8090/api/v1/auth/me', {
                    method: 'GET',
                    credentials: 'include',
                })
                const result = await response.json()
                setCurrentUser({ userName: result.data.userName })
            } catch (error) {
                console.error('현재 사용자 정보를 불러오지 못했습니다:', error)
            }
        }

        fetchCurrentUser()
    }, [])

    return currentUser
}
