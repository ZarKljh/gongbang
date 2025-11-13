// components/types/mainContent.types.ts

export interface MainContentProps {
    activeTab: string
    activeSubTab: string
    onSubTabClick: (tab: string) => void

    userData: any
    stats: any
    orders: any[]
    cart: any[]
    myReviews: any[]
    addresses: any[]
    paymentMethods: any[]
    wishList: any[]
    followList: any[]
    qna: any[]

    studioList: any[]
    studio: any

    tempData?: any
    isAuthenticated?: boolean
    editMode?: any
    passwordInput?: string
    newPassword?: string
    confirmPassword?: string
    onVerifyPassword?: () => void
    onEdit?: (section: string) => void
    onSave?: (section: string) => void
    onCancel?: (section: string) => void
    onTempChange?: (field: string, value: string) => void
    onNewPasswordChange?: (val: string) => void
    onConfirmPasswordChange?: (val: string) => void
}
