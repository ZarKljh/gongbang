// lib/api.ts
import axios from 'axios'

export type InquiryType = 'USER' | 'BUSINESS'

export type AdminMe = {
    id: number
    email: string
    name?: string
    role?: string
}

const baseURL = process.env.NEXT_PUBLIC_ADMIN_API ?? 'http://localhost:8090'

export const api = axios.create({
    baseURL: 'http://localhost:8090/api/v1',
    withCredentials: true, // 필요 없으면 제거해도 됩니다.
    timeout: 10000,
    headers: {
        // fetch에서 쓰던 cache: "no-store"와 유사하게 캐시 회피
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
    },
})

// 공통 에러 메시지 변환
function toMessage(e: unknown, fallback = '불명확한 오류가 발생했습니다.') {
    if (axios.isAxiosError(e)) {
        return (e.response?.data as any)?.message || e.message || fallback
    }
    return fallback
}

export const AdminAPI = {
    async me(): Promise<AdminMe> {
        try {
            const r = await api.get('/api/admin/v1/me')
            return r.data as AdminMe
        } catch (e) {
            throw new Error(toMessage(e, '관리자 정보를 불러오지 못했습니다.'))
        }
    },

    async inquiryCount(type: InquiryType): Promise<number> {
        const r = await api.get('/api/admin/v1/inquiries/count/by-type', {
            params: { type },
        })
        return Number(r.data?.count ?? 0)
    },

    async acknowledgeInquiries(type: InquiryType): Promise<void> {
        await api.post('/api/admin/v1/inquiries/ack/by-type', null, {
            params: { type },
        })
    },

    async reportCount(): Promise<number> {
        const r = await api.get('/api/admin/v1/reports/count/pending')
        return Number(r.data?.count ?? 0)
    },

    async acknowledgeReports(): Promise<void> {
        await api.post('/api/admin/v1/reports/ack')
    },
}

export default api

export const MetricsAPI = {
    async monthlyVisitors(year: number) {
        const { data } = await api.get('admin/metrics/visitors/monthly', {
            params: { year },
        })
        return data as Array<{ month: string; visitors: number }>
    },
}

export const fetchStats = async (userId: number) => {
    const { data } = await api.get(`/mypage/stats?userId=${userId}`)
    return data
}
