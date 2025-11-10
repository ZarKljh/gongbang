//personal/seller 페이지

'use client'

import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import SellerSidebar from './sellerPageLeftSide' // 경로는 실제 위치에 맞게 조정
import SellerPageMainContent from './sellerPageMainContent'
import '@/app/personal/seller/[id]/sellerPage.css'

export default function SellerPage() {
    const params = useParams()
    const router = useRouter()
    const sellerId = params?.id

    //현재 로그인 사용자 정보
    //const currentUser = useCurrentUser()
    //도메인별 변수세팅
    const [seller, setSeller] = useState({
        userName: '',
        nickName: '',
        fullName: '',
        email: '',
        gender: '',
        birth: '',
        mobilePhone: '',
    })

    const [studioList, setStudioList] = useState([])
    const [studio, setStudio] = useState({
        studioId: '',
        studioName: '',
        studioDescription: '',
        studioMobile: '',
        studioOfficeTell: '',
        studioFax: '',
        studioEmail: '',
        studioBusinessNumber: '',
        studioAddPostNumber: '',
        studioAddMain: '',
        studioAddDetail: '',
    })
    const [productList, setProductList] = useState([])
    // ✅ 대표 이미지 상태를 객체로 관리

    const [mainImage, setMainImage] = useState({
        mainImageFileName: '',
        mainImageUrl: '',
    })
    //현재 선택되어진 탭
    const [activeTab, setActiveTab] = useState('seller-profile')
    //현재 선택되어진 studio의 ID값
    const [selectedStudioId, setSelectedStudioId] = useState(null)

    useEffect(() => {
        if (!sellerId) {
            alert('셀러정보를 확인할수 없습니다')
            router.back()
            return // id 없으면 fetch 안 함
        }
        const fetchSellerById = async () => {
            try {
                const response = await fetch(`http://localhost:8090/api/v1/personal/seller/${sellerId}`, {
                    method: 'GET',
                    credentials: 'include',
                })
                if (!response.ok) {
                    throw new Error('셀러 정보를 불러올 수 없습니다.')
                }
                const result = await response.json()
                const { seller: sellerData, studioList: studioListData } = result.data

                console.log('요청을 보냈습니다')
                //도메인별 변수세팅
                setSeller({
                    userName: sellerData.userName,
                    nickName: sellerData.nickName,
                    fullName: sellerData.fullName,
                    email: sellerData.email,
                    gender: sellerData.gender,
                    birth: sellerData.birth,
                    mobilePhone: sellerData.mobilePhone,
                })
                console.log('셀러 정보를 셋팅하였습니다')

                setStudioList(studioListData)
                console.log('studioList 정보를 셋팅하였습니다')

                if (studioListData.length > 0) {
                    const defaultStudio = studioListData[0]
                    setSelectedStudioId(defaultStudio.studioId) // 선택된 ID 저장
                    setStudio({
                        studioId: defaultStudio.studioId,
                        studioName: defaultStudio.studioName,
                        studioDescription: defaultStudio.studioDescription,
                        studioMobile: defaultStudio.studioMobile,
                        studioOfficeTell: defaultStudio.studioOfficeTell,
                        studioFax: defaultStudio.studioFax,
                        studioEmail: defaultStudio.studioEmail,
                        studioBusinessNumber: defaultStudio.studioBusinessNumber,
                        studioAddPostNumber: defaultStudio.studioAddPostNumber,
                        studioAddMain: defaultStudio.studioAddMain,
                        studioAddDetail: defaultStudio.studioAddDetail,
                    })
                    console.log('studio 정보를 셋팅하였습니다')
                }
            } catch (error) {
                alert('오류가 발생했습니다')
                router.back()
            }
        }
        fetchSellerById()
    }, [sellerId])
    /*
    const handleStudioSelect = (studioId) => {
        if (!studioId && studioId !== 0) return //
        //const selectedStudio = studioList.find((s) => s.studioId === studioId)
        const selectedStudio = studioList.find((s) => Number(s.studioId) === Number(studioId))
        if (selectedStudio) {
            setSelectedStudioId(studioId)
            setStudio({
                studioName: selectedStudio.studioName,
                studioDescription: selectedStudio.studioDescription,
                studioMobile: selectedStudio.studioMobile,
                studioOfficeTell: selectedStudio.studioOfficeTell,
                studioFax: selectedStudio.studioFax,
                studioEmail: selectedStudio.studioEmail,
                studioBusinessNumber: selectedStudio.studioBusinessNumber,
                studioAddPostNumber: selectedStudio.studioAddPostNumber,
                studioAddMain: selectedStudio.studioAddMain,
                studioAddDetail: selectedStudio.studioAddDetail,
            })
        }
    }
    */

    // ✅ 공방 선택 핸들러
    const handleStudioSelect = (studioId) => {
        const selectedStudio = studioList.find((s) => Number(s.studioId) === Number(studioId))
        if (selectedStudio) {
            setSelectedStudioId(selectedStudio.studioId)
            setStudio(selectedStudio)
        }
    }

    // ------------------- 클릭 시 수정 취소 -------------------
    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName)
        setEditMode({})
        setTempData({ ...userData })
    }

    /** ------------------- 렌더링 ------------------- */
    return (
        <div className="seller-page-container">
            <SellerSidebar
                seller={seller}
                studioList={studioList}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedStudioId={selectedStudioId}
                handleStudioSelect={handleStudioSelect}
            />
            <SellerPageMainContent />
        </div>
    )
}
