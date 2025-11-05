//personal/seller 페이지

'use client'

import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import SellerSidebar from './sellerPageLeftSide' // 경로는 실제 위치에 맞게 조정

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
    })
    const [studio, setStudio] = useState({
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
    const [studioList, setStudioList] = useState([])
    const [productList, setProductList] = useState([])
    // ✅ 대표 이미지 상태를 객체로 관리

    const [mainImage, setMainImage] = useState({
        mainImageFileName: '',
        mainImageUrl: '',
    })

    const [activeTab, setActiveTab] = useState('seller-profile')
    const [selectedStudioId, setSelectedStudioId] = useState(null)

    useEffect(() => {
        if (!sellerId) {
            alert('셀러정보를 확인할수 없습니다')
            router.back()
            return // id 없으면 fetch 안 함
        }
        const fetchStudioById = async () => {
            try {
                const response = await fetch(`http://localhost:8090/api/v1/seller/${sellerId}`, {
                    method: 'GET',
                    credentials: 'include',
                })
                if (!response.ok) {
                    throw new Error('셀러 정보를 불러올 수 없습니다.')
                }
                const result = await response.json()
                const { studio: studioData, studioList: studioListData } = result.data

                console.log('요청을 보냈습니다')
                //도메인별 변수세팅
                setSeller({
                    userName: studioData.userName,
                    nickName: studioData.nickName,
                })
                console.log('셀러 정보를 셋팅하였습니다')
                setStudio({
                    studioName: studioData.studioName,
                    studioDescription: studioData.studioDescription,
                    studioMobile: studioData.studioMobile,
                    studioOfficeTell: studioData.studioOfficeTell,
                    studioFax: studioData.studioFax,
                    studioEmail: studioData.studioEmail,
                    studioBusinessNumber: studioData.studioBusinessNumber,
                    studioAddPostNumber: studioData.studioAddPostNumber,
                    studioAddMain: studioData.studioAddMain,
                    studioAddDetail: studioData.studioAddDetail,
                })
                console.log('studio 정보를 셋팅하였습니다')
                setStudioList(studioListData)
                console.log('studioList 정보를 셋팅하였습니다')
            } catch (error) {
                alert('오류가 발생했습니다')
                router.back()
            }
        }
        /*
        const fetchMainImage = async () => {
            try {
                const response = await fetch(`http://localhost:8090/api/v1/studio/${studioId}/studio-main-image`, {
                    method: 'GET',
                    credentials: 'include',
                })
                if (!response.ok) throw new Error('대표 이미지 정보를 불러올 수 없습니다.')

                const result = await response.json()
                const { imageFileName, imageUrl } = result.data

                setMainImage({
                    mainImageFileName: imageFileName,
                    mainImageUrl: `http://localhost:8090${imageUrl}`,
                })
            } catch (error) {
                console.error('대표 이미지 로딩 실패:', error)
            }
        }
        */
        /*
            const fetchProductList = async () => {
                try {
                    const response = await fetch(`http://localhost:8090/api/v1/studio/${studioId}/products`, {
                        method: 'GET',
                        credentials: 'include',
                    })
                    const result = await response.json()
                    console.log('productList 정보를 셋팅하였습니다')
                    setProductList(result.data.content)
                    console.log('productList 정보를 셋팅하였습니다')
                } catch (error) {
                    console.error('상품 리스트 로딩 실패:', error)
                }
            }
            */
        fetchStudioById()
        //fetchProductList()
    }, [sellerId])

    /** ------------------- 렌더링 ------------------- */
    return (
        <>
            <SellerSidebar
                seller={seller}
                studioList={studioList}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedStudioId={selectedStudioId}
                setSelectedStudioId={setSelectedStudioId}
            />
        </>
    )
}
