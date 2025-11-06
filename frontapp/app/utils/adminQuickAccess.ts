// src/app/utils/adminQuickAccess.ts
import { api } from '@/app/utils/api' // 네가 쓰는 axios 인스턴스 기준

export type PendingCounts = {
    shop: number // 입점 신청
    report: number // 신고 관리
    inquiry: number // 문의 신청
}

export async function fetchPendingCounts(): Promise<PendingCounts> {
    const [reportRes, inquiryRes] = await Promise.all([
        // 신고 미처리
        api.get('/api/admin/v1/reports/count/pending'),

        // 입점 신청 관련 문의 (사업자/셀러 문의 타입)
        api.get('/api/admin/v1/inquiries/count'),
    ])

    const extractCount = (res: any): number => {
        const d = res.data
        // 응답이 {count: n} 이거나 {data: {count: n}} 둘 다 대비
        if (d?.count != null) return d.count
        if (d?.data?.count != null) return d.data.count
        return 0
    }

    return {
        report: extractCount(reportRes),
        inquiry: extractCount(inquiryRes),
        shop: 0,
    }
}
