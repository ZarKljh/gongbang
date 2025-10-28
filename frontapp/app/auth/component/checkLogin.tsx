import api from '@/app/utils/api'

//promise 자바스크립트에서 비동기 작업의 완료 또는 실패를 나타내는 객체
//pendgin: 아직작업이 완료되지 않음
//fulfilled: 작업이 성공적으로 완료됨
//rejected: 작업이 실패함
/*
export const checkLoginStatus = async (): Promise<boolean> => {
    try {
        const res = await api.get('/auth/me') // access token으로 사용자 정보 확인
        console.log('✅ 로그인 상태 확인 성공:', res.status, res.data)
        return res.status === 200
    } catch (err) {
        console.error('❌ 로그인 상태 확인 실패:', err)
        return false
    }
}
*/
export const checkLoginStatus = async (): Promise<boolean> => {
    try {
        const res = await fetch('http://localhost:8090/api/auth/me', {
            method: 'GET',
            credentials: 'include', // ✅ 쿠키 포함
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const data = await res.json()
        console.log('✅ 로그인 상태 확인 성공:', res.status, data)

        return res.status === 200
    } catch (err) {
        console.error('❌ 로그인 상태 확인 실패:', err)
        return false
    }
}
