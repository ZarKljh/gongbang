import { api } from '@/app/utils/api'

export type PendingCounts = {
    shop: number // 입점 신청
    report: number // 신고 관리
    inquiry: number // 문의 신청
}

export async function fetchPendingCounts(): Promise<PendingCounts> {
    const [reportRes, inquiryRes] = await Promise.all([
        api.get('/admin/reports/count/pending'),

        api.get('/admin/inquiries/count'),
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
