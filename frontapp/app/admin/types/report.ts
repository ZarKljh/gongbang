export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED'

export type Report = {
    id: number
    reporterEmail: string
    targetType: 'POST' | 'COMMENT' | 'USER' | string
    targetId: number
    reason: string
    description?: string
    status: ReportStatus
    createdAt: string
    handledAt?: string | null
    handledByAdminId?: number | null
}
