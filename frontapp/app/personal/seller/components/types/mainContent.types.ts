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
    onAddressSearch?: () => void
    // ====== 이미지 업로드 공통 핸들링 ======
    /** 현재 업로드된 이미지 파일들 저장용 */
    studioImages?: {
        STUDIO_MAIN: File | null
        STUDIO_LOGO: File | null
        STUDIO: File[]
    }

    /** 이미지 변경 핸들러 */
    onStudioImageChange?: (refType: 'STUDIO_MAIN' | 'STUDIO_LOGO' | 'STUDIO', files: File | File[] | null) => void

    /** 스튜디오 저장 후 호출되는 이미지 업로드 함수 */
    onStudioImagesUpload?: (studioId: number) => Promise<void>

    deletedGalleryImageIds?: number[]
    setDeletedGalleryImageIds?: (ids: number[]) => void
    setStudioImages?: (updater: any) => void

    /** 삼품관련 props*/
    // ====== 상품 리스트 / 검색 / 페이징 관련 ======
    productList?: any[]
    productPage?: number
    productPageSize?: number
    productHasNext?: boolean
    productLoading?: boolean

    setProductPage?: (page: number) => void
    setProductPageSize?: (size: number) => void
    fetchStudioProducts?: (studioId: number, page?: number) => void

    /** 🔥 검색 조건 객체 전달 (필수) */
    productFilters?: {
        keyword: string
        priceMin: number
        priceMax: number
        active: any[]
        stock: any[]
        status: any[]
        //searchFields: string[]
    }

    setProductFilters?: (updater: any) => void

    categoryOptions?: string[]
    subcategoryOptions?: string[]
    globalCategoryOptions?: string[]
    globalSubcategoryOptions?: string[]

    productImages?: {
        PRODUCT_MAIN: File | null
        PRODUCT: File[]
    }

    onProductImageChange?: (type: 'PRODUCT_MAIN' | 'PRODUCT', files: File | File[] | null) => void
    onTabClick?: (tab: string) => void
}
