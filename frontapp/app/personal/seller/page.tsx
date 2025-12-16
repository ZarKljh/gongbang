'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { api } from '@/app/utils/api'
import './sellerPage.css'
import Sidebar from './components/sideBar'
import MainContent from './components/mainContent'

//const API_BASE_URL = 'https://localhost:8090/api/v1'
const API_BASE_URL = api.defaults.baseURL

export default function MyPage() {
    // ======= 상태 관리 =======
    // userData---> seller 데이터 대체
    const [userData, setUserData] = useState<any>(null)
    const [stats, setStats] = useState<any>({ totalQna: 0, totalReviews: 0 })
    const [activeTab, setActiveTab] = useState('studio')
    const [activeSubTab, setActiveSubTab] = useState('studio')
    const [loading, setLoading] = useState(true)

    // =========== 인증 & 회원정보 ============
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})
    const [tempData, setTempData] = useState<any>({})
    const [passwordInput, setPasswordInput] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // 탭별 데이터 상태
    const [orders, setOrders] = useState<any[]>([])
    const [cart, setCart] = useState<any[]>([])
    const [myReviews, setMyReviews] = useState<any[]>([])
    const [addresses, setAddresses] = useState<any[]>([])
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])
    const [wishList, setWishList] = useState<any[]>([])
    const [followList, setFollowList] = useState<any[]>([])
    const [qna, setQna] = useState<any[]>([])

    // seller&studio 데이터 상태
    const [studioList, setStudioList] = useState<any[]>([])
    const [studio, setStudio] = useState<any>(null)

    // 공방에 걸려있는 팔로우갯수
    const [studioFollowerCount, setStudioFollowerCount] = useState(0)

    // 이미지저장을 위한 데이터 상태
    // 공방 관련 이미지 상태 (STUDIO_MAIN / STUDIO_LOGO / STUDIO 등 refType별)
    const [studioImages, setStudioImages] = useState({
        STUDIO_MAIN: null as File | null,
        STUDIO_LOGO: null as File | null,
        STUDIO: [] as File[],
    })
    const [deletedGalleryImageIds, setDeletedGalleryImageIds] = useState<number[]>([])

    //상품리스트 관련 데이터상태
    const [productTotalCount, setProductTotalCount] = useState(0) //상품전체갯수
    const [productList, setProductList] = useState<any[]>([]) // 현재 화면에 표시되는 상품 리스트 데이터
    const [productPage, setProductPage] = useState(0) // 현재 페이지 번호 (백엔드의 page 파라미터와 동일, 0부터 시작)
    const [productPageSize, setProductPageSize] = useState(5) // 한 페이지에 불러올 상품 개수 (페이지 사이즈)
    const [productHasNext, setProductHasNext] = useState(true) // 다음 페이지가 존재하는지 여부 (백엔드 응답의 data.last 기반)
    const [productLoading, setProductLoading] = useState(false) // 상품 데이터를 불러오는 중인지 여부 (로딩 스피너 / 중복 요청 방지용)

    const [productFilters, setProductFilters] = useState({
        keyword: '',
        priceMin: 0,
        priceMax: 100000,
        active: [], // true/false
        stock: [], // ["inStock", "outOfStock"]
        status: [], // ["PUBLISHED", "HIDDEN"]
        category: '',
        //searchFields: ['name'], // ["name", "categoryName", "subcategoryName"]
    })
    const [categoryOptions, setCategoryOptions] = useState<any[]>([])
    const [subcategoryOptions, setSubcategoryOptions] = useState<any[]>([])

    const [globalCategoryOptions, setGlobalCategoryOptions] = useState<any[]>([])
    const [globalSubcategoryOptions, setGlobalSubcategoryOptions] = useState<any[]>([])

    const [productImages, setProductImages] = useState({
        PRODUCT_MAIN: null as File | null,
        PRODUCT: [] as File[],
    })

    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const resetProductState = () => {
        setSelectedProductId(null)
        setTempData({})
        setProductImages({
            PRODUCT_MAIN: null,
            PRODUCT: [],
        })
        setEditMode((prev) => ({ ...prev, productModify: false }))
    }

    // ======= 초기 로딩 =======
    useEffect(() => {
        const init = async () => {
            try {
                const user = await fetchUser()
                if (!user?.id) return
                await Promise.all([
                    fetchOrders(user.id),
                    fetchCart(user.id),
                    fetchAddresses(user.id),
                    fetchPaymentMethods(user.id),
                    fetchWishList(user.id),
                    fetchFollowList(user.id),
                    fetchQna(user.id),
                    fetchMyReviews(user.id),
                    fetchStats(user.id),
                    fetchStudioList(user.id),
                    fetchStudio(user.id),
                ])
            } catch (error) {
                console.error('초기 로딩 실패:', error)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    // ======= API 함수 =======
    const fetchUser = async () => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/me`, { withCredentials: true })
        setUserData(data.data)
        return data.data
    }

    const fetchOrders = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/orders`, { withCredentials: true })
        setOrders(data.data)
    }
    const fetchCart = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/cart`, { withCredentials: true })
        setCart(data.data)
    }
    const fetchAddresses = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/addresses?userId=${id}`, { withCredentials: true })
        setAddresses(data.data)
    }
    const fetchPaymentMethods = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/payment-methods`, { withCredentials: true })
        setPaymentMethods(data.data)
    }
    const fetchWishList = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/wishlist`, { withCredentials: true })
        setWishList(data.data)
    }
    const fetchFollowList = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/follow?userId=${id}`, { withCredentials: true })
        setFollowList(data.data)
    }
    const fetchQna = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/qna?userId=${id}`, { withCredentials: true })
        setQna(data.data)
    }
    const fetchMyReviews = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/reviews`, { withCredentials: true })
        setMyReviews(data.data.studioList)
    }
    const fetchStats = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/mypage/stats?userId=${id}`, { withCredentials: true })
        setStats(data.data)
    }

    //공방 전체 리스트 fetch
    const fetchStudioList = async (id: number) => {
        const { data } = await axios.get(`${API_BASE_URL}/personal/seller/studioList/${id}`, { withCredentials: true })
        setStudioList(data.data.studioList)
    }
    //공방 전체 리스트중 최초 등록 공방 fetch
    const fetchStudio = async (id: number) => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/personal/seller/studio/${id}`, { withCredentials: true })
            //console.log('📌 fetchStudio 응답:', data.data)
            setStudio(data.data.studio)
        } catch (err: any) {
            console.warn('📌 스튜디오 정보 없음 또는 오류:', err?.response?.status)
            setStudio(null) // 스튜디오 없음으로 처리
        }
    }

    const fetchFollowerCount = async (studioId: number) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/studio/${studioId}/followers/count`, { withCredentials: true })
            setStudioFollowerCount(res.data.data) // 숫자라고 가정
            console.log('공방ID: ', studioId)
            console.log('팔로워수 : ', res)
        } catch (err) {
            console.error('팔로워 수 로딩 실패:', err)
        }
    }

    const fetchStudioProducts = async (studioId: number, page = 0) => {
        if (!studioId) return
        setProductLoading(true)

        try {
            // ⭐ 여기서 stock 값 변환만 추가 ⭐
            const stockParam = productFilters.stock
                .map((s) => (s === 'in' ? 'inStock' : s === 'out' ? 'outOfStock' : ''))
                .filter(Boolean)

            const query = new URLSearchParams({
                page: String(page),
                size: String(productPageSize),

                // 🔍 검색 필터
                keyword: productFilters.keyword,
                //searchFields: productFilters.searchFields.join(','),

                priceMin: String(productFilters.priceMin),
                priceMax: String(productFilters.priceMax),

                active: productFilters.active.join(','),
                stock: productFilters.stock.join(','),
                //stock: stockParam.join(','),
                status: productFilters.status.join(','),
            })

            if (productFilters.category) {
                query.set('category', productFilters.category)
            }

            const response = await fetch(`${API_BASE_URL}/studio/${studioId}/studio-products?${query.toString()}`, {
                method: 'GET',
                credentials: 'include',
            })

            const result = await response.json()
            const data = result.data

            // 페이지 교체 방식 (검색/페이징용)
            setProductTotalCount(data.totalElements)
            setProductList(data.content ?? [])
            setProductHasNext(!data.last)
            setProductPage(data.number)
        } catch (err) {
            console.error('상품 목록 조회 실패:', err)
            setProductList([])
        } finally {
            setProductLoading(false)
        }
    }
    const fetchCategorySummary = async (studioId: number) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/studio/${studioId}/category-summary`, {
                withCredentials: true,
            })

            const { categories, subcategories } = res.data.data

            setCategoryOptions(categories) // [{id,name}]
            setSubcategoryOptions(subcategories) // [{id,name}]
        } catch (err) {
            console.error('카테고리 옵션 조회 실패:', err)
            setCategoryOptions([])
            setSubcategoryOptions([])
        }
    }

    const fetchGlobalCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/studio/globalCategories`, { withCredentials: true })
            const { categories, subcategories } = res.data.data

            setGlobalCategoryOptions(categories)
            setGlobalSubcategoryOptions(subcategories)
        } catch (error) {
            console.error('전역 카테고리 조회 실패', error)
        }
    }

    const fetchProductDetail = async (productId: number) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/studio/product/${productId}`, {
                withCredentials: true,
            })

            const p = res.data.data

            setTempData({
                productId: p.id,
                name: p.name,
                slug: p.slug,
                subtitle: p.subtitle,
                basePrice: p.basePrice,
                stockQuantity: p.stockQuantity,
                backorderable: String(p.backorderable),
                active: String(p.active),
                status: p.status,
                categoryId: p.categoryId,
                categoryName: p.categoryName,
                subcategoryId: p.subcategoryId,
                subcategoryName: p.subcategoryName,
                summary: p.summary,
                description: p.description,
                seoTitle: p.seoTitle,
                seoDescription: p.seoDescription,

                // 기존 이미지 URL
                productMainImageName: p.productMainImage?.imageFileName || '',
                productMainImageUrl: p.productMainImage?.imageFileName || null,
                //productGalleryImageUrls: p.galleryImages.map((g: any) => g.imageUrl),
                //productGalleryImageNames: p.galleryImages.map((g: any) => g.imageFileName),
            })
            console.log('prductDetail : ', p)
            console.log('tempData: ', tempData)

            setProductImages({
                PRODUCT_MAIN: null,
                PRODUCT: [],
            })
        } catch (err) {
            console.error('상품 상세 조회 실패:', err)
        }
    }

    const deleteSingleProduct = async (productId: number) => {
        if (!studio?.studioId) {
            alert('공방 정보가 없습니다.')
            return
        }

        try {
            const res = await axios.delete(`${API_BASE_URL}/studio/single-delete/${productId}`, {
                withCredentials: true,
            })

            if (res.data.resultCode !== '200') {
                alert('삭제 실패: ' + res.data.msg)
                return
            }

            alert('상품이 삭제되었습니다.')

            // 상품 목록 새로고침
            fetchStudioProducts(studio.studioId, 0)

            // 🔥 productList 탭으로 전환
            setActiveTab('productList')

            // 필요하다면 선택된 productId도 초기화
            setSelectedProductId(null)
            setTempData({})
        } catch (err) {
            console.error('단건 삭제 실패:', err)
            alert('삭제 중 오류가 발생했습니다.')
        }
    }

    const deleteMultipleProducts = async (productIds: number[]) => {
        if (!studio?.studioId) return alert('공방 정보가 없습니다.')

        try {
            const res = await axios.post(`${API_BASE_URL}/studio/multiple-delete`, productIds, {
                withCredentials: true,
            })

            if (res.data.resultCode !== '200') {
                alert('삭제 실패: ' + res.data.msg)
                return
            }

            alert('선택된 상품이 삭제되었습니다.')

            // 🔥 목록 새로고침
            fetchStudioProducts(studio.studioId, 0)
        } catch (err) {
            console.error('일괄 삭제 실패:', err)
            alert('삭제 중 오류가 발생했습니다.')
        }
    }

    useEffect(() => {
        if (studio?.studioId) {
            fetchStudioProducts(studio?.studioId, 0)
            fetchFollowerCount(studio?.studioId)
        }
    }, [studio])

    useEffect(() => {
        if (!studio?.studioId) return

        const delay = setTimeout(() => {
            // 상품 목록 갱신
            fetchStudioProducts(studio.studioId, 0)

            // 카테고리 select 갱신 (전체 범위용)
            fetchCategorySummary(studio.studioId)
        }, 300)

        return () => clearTimeout(delay)
    }, [productFilters])

    useEffect(() => {
        if (!studio?.studioId) return
        fetchStudioProducts(studio.studioId, 0)
    }, [productPageSize])

    useEffect(() => {
        if (!studio?.studioId) return
        fetchCategorySummary(studio.studioId) // ★ 추가
    }, [studio])

    useEffect(() => {
        if (activeTab === 'productAdd') {
            fetchGlobalCategories()
        }
    }, [activeTab])

    // =============== 🔐 회원정보 관련 함수 ===============
    const handleVerifyPassword = async () => {
        if (!passwordInput) return alert('비밀번호를 입력해주세요.')

        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/mypage/me/verify-password`,
                { userId: userData.id, password: passwordInput },
                { withCredentials: true },
            )
            if (data.resultCode === '200') {
                setIsAuthenticated(true)
                alert('비밀번호 인증 완료')
            } else alert('비밀번호가 올바르지 않습니다.')
        } catch (err) {
            console.error('인증 실패:', err)
            alert('인증 중 오류가 발생했습니다.')
        }
    }

    const handleAddressSearch = () => {
        if (typeof window === 'undefined' || !window.daum) {
            alert('주소 검색 기능을 사용할 수 없습니다. 페이지를 새로고침 해주세요.')
            return
        }
        new window.daum.Postcode({
            oncomplete: function (data: any) {
                // ✅ [수정 2] onChange 대신 setStudioInfo 직접 호출
                setTempData((prev) => ({
                    ...prev,
                    studioAddPostNumber: data.zonecode,
                    studioAddMain: data.roadAddress,
                    studioAddDetail: '',
                }))
            },
        }).open()
    }

    // =============== 🖼 공통 이미지 업로드 핸들러 ===============
    /**
     * refType: STUDIO_MAIN / STUDIO_LOGO / STUDIO 등
     * options.multiple: true이면 여러장, false면 단일
     * options.max: multiple일 때 최대 개수 (기본 5)
     */
    const handleStudioImageChange = (refType: 'STUDIO_MAIN' | 'STUDIO_LOGO' | 'STUDIO', files: File | File[]) => {
        setStudioImages((prev) => ({
            ...prev,
            [refType]: Array.isArray(files) ? files : files,
        }))
        setTempData((prev) => {
            const next = { ...prev }

            if (refType === 'STUDIO_MAIN' && files instanceof File) {
                next.studioMainImageName = files.name
                next.studioMainImageUrl = URL.createObjectURL(files)
            }

            if (refType === 'STUDIO_LOGO' && files instanceof File) {
                next.studioLogoImageName = files.name
                next.studioLogoImageUrl = URL.createObjectURL(files)
            }

            if (refType === 'STUDIO') {
                const fileArray = Array.isArray(files) ? files : [files]
                next.studioGalleryImageNames = fileArray.map((f) => f.name)
                next.studioGalleryImageUrls = fileArray.map((f) => URL.createObjectURL(f))
            }

            return next
        })
    }

    /**
     * refType + refId + 파일들을 FormData로 구성
     * - Image 엔티티: refType, refId, imageUrl, imageFileName, sortOrder
     */
    const buildStudioImageFormData = (studioId: number): FormData | null => {
        const form = new FormData()
        let hasFile = false

        // STUDIO_MAIN, STUDIO_LOGO: File
        // STUDIO: File[]
        if (studioImages.STUDIO_MAIN) {
            form.append('files', studioImages.STUDIO_MAIN)
            form.append('refType', 'STUDIO_MAIN')
            form.append('refId', String(studioId))
            form.append('sortOrder', '0')
            hasFile = true
        }

        if (studioImages.STUDIO_LOGO) {
            form.append('files', studioImages.STUDIO_LOGO)
            form.append('refType', 'STUDIO_LOGO')
            form.append('refId', String(studioId))
            form.append('sortOrder', '0')
            hasFile = true
        }

        if (studioImages.STUDIO.length > 0) {
            studioImages.STUDIO.forEach((f, idx) => {
                form.append('files', f)
                form.append('refType', 'STUDIO')
                form.append('refId', String(studioId))
                form.append('sortOrder', String(idx))
            })
            hasFile = true
        }

        return hasFile ? form : null
    }

    /**
     * 실제 이미지 업로드 요청
     * - 백엔드 컨트롤러 예시:
     *   POST /api/v1/images/upload
     */
    const uploadStudioImages = async (studioId: number) => {
        const form = buildStudioImageFormData(studioId)
        if (!form) {
            // 업로드할 이미지가 없는 경우
            return
        }

        await axios.post(`${API_BASE_URL}/images/upload`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
        })
    }

    const handleProductImageChange = (type: 'PRODUCT_MAIN' | 'PRODUCT', files: File | File[] | null) => {
        setProductImages((prev) => ({
            ...prev,
            [type]: Array.isArray(files) ? files : files,
        }))

        // tempData에 미리보기 URL 저장
        setTempData((prev) => {
            const next = { ...prev }

            if (type === 'PRODUCT_MAIN' && files instanceof File) {
                next.productMainImageUrl = URL.createObjectURL(files)
                next.productMainImageName = files.name
            }

            if (type === 'PRODUCT') {
                const arr = Array.isArray(files) ? files : files ? [files] : []
                next.productGalleryImageUrls = arr.map((f) => URL.createObjectURL(f))
                next.productGalleryImageNames = arr.map((f) => f.name)
            }

            return next
        })
    }

    const handleEdit = (section: string) => {
        if (!isAuthenticated) return alert('비밀번호 인증이 필요합니다.')
        setEditMode({ ...editMode, [section]: true })
        //setTempData({ ...userData, ...studio })
        if (section === 'profile') {
            setTempData({ ...userData })
        }
        if (section === 'studio') {
            setTempData({ ...studio })
        }
        if (section === 'studioDesc') {
            setTempData({ ...studio })
        }
        if (section === 'studioAdd') {
            setTempData({}) // 신규 입력은 완전 빈 값
            // 또는 기본값으로 초기화 가능
        }
        if (section === 'productAdd') {
            setTempData({})
        }
        if (section === 'productModify') {
            //setEditMode((prev) => ({ ...prev, productModify: true }))
            fetchProductDetail(selectedProductId!)
            fetchGlobalCategories()
            setActiveTab('productModify')
            return
        }
    }

    const handleSave = async (section: string) => {
        if (!userData?.id) return
        //if (newPassword && newPassword !== confirmPassword) return alert('비밀번호 확인이 일치하지 않습니다.')
        if (newPassword && newPassword !== confirmPassword) {
            return alert('비밀번호 확인이 일치하지 않습니다.')
        }
        try {
            let response

            // 2️⃣ 프로필 저장
            if (section === 'profile') {
                response = await axios.patch(
                    `${API_BASE_URL}/mypage/me/${userData.id}`,
                    {
                        nickName: tempData.nickName,
                        email: tempData.email,
                        mobilePhone: tempData.mobilePhone,
                        ...(newPassword ? { password: newPassword } : {}),
                    },
                    { withCredentials: true },
                )

                if (response.data.resultCode === '200') {
                    setUserData(response.data.data)
                    alert('회원 정보가 수정되었습니다.')
                }
            }

            // 3️⃣ 공방정보 수정
            else if (section === 'studio' || section === 'studioDesc') {
                const form = new FormData()
                const requestJson = {
                    studioBusinessNumber: tempData.studioBusinessNumber,
                    categoryId: tempData.categoryId,
                    studioName: tempData.studioName,
                    studioDescription: tempData.studioDescription,
                    studioMobile: tempData.studioMobile,
                    studioOfficeTell: tempData.studioOfficeTell,
                    studioFax: tempData.studioFax,
                    studioEmail: tempData.studioEmail,
                    studioAddPostNumber: tempData.studioAddPostNumber,
                    studioAddMain: tempData.studioAddMain,
                    studioAddDetail: tempData.studioAddDetail,
                    studioMainImageName: studioImages.STUDIO_MAIN ? studioImages.STUDIO_MAIN.name : '',
                    studioLogoImageName: studioImages.STUDIO_LOGO ? studioImages.STUDIO_LOGO.name : '',
                    studioGalleryImageNames: studioImages.STUDIO.map((f) => f.name),
                }
                form.append('request', new Blob([JSON.stringify(requestJson)], { type: 'application/json' }))
                form.append('deletedGalleryImageIds', JSON.stringify(deletedGalleryImageIds))

                if (studioImages.STUDIO_MAIN) {
                    form.append('studioMainImage', studioImages.STUDIO_MAIN)
                }
                if (studioImages.STUDIO_LOGO) {
                    form.append('studioLogoImage', studioImages.STUDIO_LOGO)
                }
                if (studioImages.STUDIO.length > 0) {
                    studioImages.STUDIO.forEach((file) => {
                        form.append('studioGalleryImages', file)
                    })
                }
                /*
                    else {
                        // 🔥 중요: key 자체가 없으면 서버에서 null 발생 → replace 함수가 정상 작동 안 함
                        form.append('studioGalleryImages', new Blob([], { type: 'application/octet-stream' }))
                    }
                    */
                const response = await axios.patch(`${API_BASE_URL}/studio/${studio.studioId}`, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                })

                if (response.data.resultCode === '200') {
                    alert('공방 정보가 수정되었습니다.')
                    await fetchStudio(userData.id)
                    setStudioImages({
                        STUDIO_MAIN: null,
                        STUDIO_LOGO: null,
                        STUDIO: [],
                    })
                    setDeletedGalleryImageIds([])
                    //setEditMode((prev) => ({ ...prev, studio: false }))
                    setEditMode((prev) => ({ ...prev, [section]: false }))
                }
            }
            // 3) ⭐ 신규 공방 등록
            else if (section === 'studioAdd') {
                // 1) 스튜디오 기본 정보 저장

                const requestJson = {
                    siteUserId: userData.id,
                    studioBusinessNumber: tempData.studioBusinessNumber,
                    categoryId: tempData.categoryId,
                    studioName: tempData.studioName,
                    studioDescription: tempData.studioDescription,
                    studioMobile: tempData.studioMobile,
                    studioOfficeTell: tempData.studioOfficeTell,
                    studioFax: tempData.studioFax,
                    studioEmail: tempData.studioEmail,
                    studioAddPostNumber: tempData.studioAddPostNumber,
                    studioAddMain: tempData.studioAddMain,
                    studioAddDetail: tempData.studioAddDetail,

                    // 이미지 파일명만 전달
                    studioMainImageName: studioImages.STUDIO_MAIN?.name ?? '',
                    studioLogoImageName: studioImages.STUDIO_LOGO?.name ?? '',
                    studioGalleryImageNames: studioImages.STUDIO.map((f) => f.name),
                }

                const form = new FormData()
                form.append('request', new Blob([JSON.stringify(requestJson)], { type: 'application/json' }))

                // 3) 이미지 파일 추가
                if (studioImages.STUDIO_MAIN) {
                    form.append('studioMainImage', studioImages.STUDIO_MAIN)
                }
                if (studioImages.STUDIO_LOGO) {
                    form.append('studioLogoImage', studioImages.STUDIO_LOGO)
                }
                if (studioImages.STUDIO.length > 0) {
                    studioImages.STUDIO.forEach((file) => {
                        form.append('studioGalleryImages', file)
                    })
                }

                // 🔥 FormData 출력
                console.log('===== FormData 확인 =====')
                for (let pair of form.entries()) {
                    console.log(pair[0], pair[1])
                }
                console.log('===== /FormData =====')
                console.log('🔥 requestJson:', requestJson)
                const res = await axios.post(`${API_BASE_URL}/studio/add`, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                })

                if (res.data.resultCode !== '200') {
                    alert('공방 등록 실패')
                    return
                }

                const newStudioId = res.data.data.studioId

                setTempData({})
                setStudioImages({
                    STUDIO_MAIN: null,
                    STUDIO_LOGO: null,
                    STUDIO: [],
                })

                await fetchStudioList(userData.id)
                await fetchStudio(userData.id)

                setEditMode((prev) => ({ ...prev, studioAdd: false }))
                alert('새 공방이 성공적으로 등록되었습니다.')
            }
            // 4) ⭐ 신규 상품 등록
            else if (section === 'productAdd') {
                if (!studio?.studioId) {
                    alert('공방 정보가 없습니다.')
                    return
                }

                const requestJson = {
                    studioId: studio.studioId,
                    name: tempData.name,
                    slug: tempData.slug,
                    categoryId: tempData.categoryId,
                    subcategoryId: tempData.subcategoryId || null,
                    subtitle: tempData.subtitle || '',
                    basePrice: Number(tempData.basePrice || 0),
                    stockQuantity: Number(tempData.stockQuantity || 0),
                    backorderable: tempData.backorderable === 'true',
                    active: tempData.active === 'true',
                    status: tempData.status,
                    productMainImageName: productImages.PRODUCT_MAIN?.name || '',
                    productGalleryImageNames: productImages.PRODUCT.map((f) => f.name),
                }

                const form = new FormData()
                form.append('request', new Blob([JSON.stringify(requestJson)], { type: 'application/json' }))

                if (productImages.PRODUCT_MAIN) {
                    form.append('productMainImage', productImages.PRODUCT_MAIN)
                }

                if (productImages.PRODUCT.length > 0) {
                    productImages.PRODUCT.forEach((f) => form.append('productGalleryImages', f))
                }

                const res = await axios.post(`${API_BASE_URL}/studio/product/new`, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                })
                console.log('📌 상품 등록 응답 ', res.data)

                if (res.data.resultCode !== '200') {
                    alert('상품 등록 실패')
                    return
                }

                alert('상품이 성공적으로 등록되었습니다.')

                // 초기화
                setProductImages({
                    PRODUCT_MAIN: null,
                    PRODUCT: [],
                })

                setTempData({})
                setEditMode((prev) => ({ ...prev, productAdd: false }))

                // 상품 목록 갱신
                fetchStudioProducts(studio.studioId, 0)
            } else if (section === 'productModify') {
                if (!studio?.studioId) {
                    alert('공방 정보가 없습니다.')
                    return
                }

                if (!tempData.productId) {
                    alert('상품 ID가 없습니다.')
                    return
                }

                const requestJson = {
                    productId: tempData.productId, // ⭐ Modify 필수
                    studioId: studio.studioId,
                    name: tempData.name,
                    slug: tempData.slug,
                    categoryId: tempData.categoryId,
                    subcategoryId: tempData.subcategoryId || null,
                    subtitle: tempData.subtitle || '',
                    basePrice: Number(tempData.basePrice || 0),
                    stockQuantity: Number(tempData.stockQuantity || 0),
                    backorderable: tempData.backorderable === 'true',
                    active: tempData.active === 'true',
                    status: tempData.status,

                    // ⭐ 기존 이미지 이름 유지
                    productMainImageName: productImages.PRODUCT_MAIN?.name || tempData.productMainImageName || '',
                    /*
                    productGalleryImageNames: [
                        ...(tempData.productGalleryImageNames || []),
                        ...productImages.PRODUCT.map((f) => f.name),
                    ],
                    */
                }

                const form = new FormData()
                form.append('request', new Blob([JSON.stringify(requestJson)], { type: 'application/json' }))

                // 새 대표 이미지만 업로드
                if (productImages.PRODUCT_MAIN) {
                    form.append('productMainImage', productImages.PRODUCT_MAIN)
                }

                // 새 갤러리 이미지 업로드
                if (productImages.PRODUCT.length > 0) {
                    productImages.PRODUCT.forEach((f) => form.append('productGalleryImages', f))
                }

                const res = await axios.patch(`${API_BASE_URL}/studio/product/${tempData.productId}`, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                })

                if (res.data.resultCode !== '200') {
                    alert('상품 수정 실패')
                    return
                }

                alert('상품이 성공적으로 수정되었습니다.')

                // 초기화
                setProductImages({
                    PRODUCT_MAIN: null,
                    PRODUCT: [],
                })

                //setTempData({})

                // ⭐ 수정 모드 종료
                setEditMode((prev) => ({ ...prev, productModify: false }))
                //setSelectedProductId(null)

                // ⭐ Product List로 돌아가기
                //onTabClick?.('productList')

                // ⭐ 목록 다시 불러오기
                fetchStudioProducts(studio.studioId, 0)
            }
        } catch (err) {
            console.error('저장 실패:', err)
            alert('저장 중 오류가 발생했습니다.')
        }
    }

    const handleCancel = (section: string) => {
        setEditMode({ ...editMode, [section]: false })
        //setTempData({ ...userData, ...studio })
        if (section === 'profile') {
            setTempData({ ...userData })
        }
        if (section === 'studio') {
            setTempData({ ...studio })
            setStudioImages({
                STUDIO_MAIN: null,
                STUDIO_LOGO: null,
                STUDIO: [],
            })
            setDeletedGalleryImageIds([])
        }
        if (section === 'studioDesc') {
            setTempData({ ...studio })
        }
        if (section === 'productAdd') {
            setTempData({})
            setProductImages({
                PRODUCT_MAIN: null,
                PRODUCT: [],
            })
        }
        if (section === 'productModify') {
            setEditMode((prev) => ({ ...prev, productModify: false }))
            //setTempData({})
            //setProductImages({ PRODUCT_MAIN: null, PRODUCT: [] })
            //setSelectedProductId(null)
        }
    }

    const handleTempChange = (field: string, value: string) => {
        //setTempData((prev: any) => ({ ...prev, [field]: value }))
        if (field === 'passwordInput') {
            setPasswordInput(value)
        } else {
            setTempData((prev: any) => ({ ...prev, [field]: value }))
        }
    }

    /*
            const onTempChange = (field: string, value: string) => {
                if (field === 'passwordInput') setPasswordInput(value)
                else setTempData((prev: any) => ({ ...prev, [field]: value }))
            }
            */

    // ======= UI 이벤트 =======
    const handleTabClick = (tab: string) => setActiveTab(tab)
    const handleSubTabClick = (sub: string) => setActiveSubTab(sub)

    // =============== 렌더링 조건 ===============
    if (loading) return <div>로딩중...</div>
    if (!studio) return <div className="need-login">등록된 공방이 없습니다</div>

    /*<button onClick={() => (window.location.href = '/auth/login')}>로그인하기</button>*/

    return (
        <div className="mypage-container">
            <Sidebar
                userData={userData}
                activeTab={activeTab}
                onTabClick={handleTabClick}
                studioList={studioList}
                studio={studio}
            />
            <MainContent
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                onSubTabClick={handleSubTabClick}
                onTabClick={handleTabClick}
                userData={userData}
                stats={stats}
                orders={orders}
                cart={cart}
                myReviews={myReviews}
                addresses={addresses}
                paymentMethods={paymentMethods}
                wishList={wishList}
                followList={followList}
                qna={qna}
                studioList={studioList}
                studio={studio}
                studioFollowerCount={studioFollowerCount}
                tempData={tempData}
                isAuthenticated={isAuthenticated}
                editMode={editMode}
                passwordInput={passwordInput}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                onVerifyPassword={handleVerifyPassword}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onTempChange={handleTempChange}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onAddressSearch={handleAddressSearch}
                studioImages={studioImages}
                onStudioImageChange={handleStudioImageChange}
                onStudioImagesUpload={uploadStudioImages}
                deletedGalleryImageIds={deletedGalleryImageIds}
                setDeletedGalleryImageIds={setDeletedGalleryImageIds}
                setStudioImages={setStudioImages}
                productTotalCount={productTotalCount}
                productList={productList}
                productPage={productPage}
                productPageSize={productPageSize}
                productHasNext={productHasNext}
                productLoading={productLoading}
                setProductPage={setProductPage}
                fetchStudioProducts={fetchStudioProducts}
                productFilters={productFilters}
                setProductFilters={setProductFilters}
                setProductPageSize={setProductPageSize}
                categoryOptions={categoryOptions}
                subcategoryOptions={subcategoryOptions}
                globalCategoryOptions={globalCategoryOptions}
                globalSubcategoryOptions={globalSubcategoryOptions}
                productImages={productImages}
                onProductImageChange={handleProductImageChange}
                selectedProductId={selectedProductId}
                setSelectedProductId={setSelectedProductId}
                fetchProductDetail={fetchProductDetail}
                onDeleteProducts={deleteMultipleProducts}
                resetProductState={resetProductState}
                deleteSingleProduct={deleteSingleProduct}
            />
        </div>
    )
}
