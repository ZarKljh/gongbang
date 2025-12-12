'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '../style/studio.css'
import ProductListScroll from '../components/productListScrollOfStudio'
import api from '@/app/utils/api'
//import useCurrentUser from '@/app/auth/common/useCurrentUser'

export default function viewStudioInfo() {
    const params = useParams()
    const router = useRouter()
    const studioId = params?.id

    //현재 로그인 사용자 정보
    //const currentUser = useCurrentUser()

    //도메인별 변수세팅
    const [seller, setSeller] = useState({
        userId: '',
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
        studioMainImage: '',
        studioLogoImage: '',
        sutdioGalleryImages: [],
    })
    const [studioList, setStudioList] = useState([])
    const [productList, setProductList] = useState([])
    // ✅ 대표 이미지 상태를 객체로 관리
    const [mainImage, setMainImage] = useState({
        mainImageFileName: '',
        mainImageUrl: '',
    })
    const [sellerProfileImage, setSellerProfileImage] = useState(null)

    const fetchSellerProfileImage = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8090/api/v1/image/profile/${userId}`, {
                method: 'GET',
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error('프로필 이미지를 불러올 수 없습니다.')
            }

            // personal 페이지와 동일 — Blob 객체 생성
            const blob = await response.blob()

            // personal 페이지와 동일 — Blob URL 생성
            const url = URL.createObjectURL(blob)

            // 상태에 저장 → img src에 바로 반영됨
            setSellerProfileImage(url)
        } catch (error) {
            console.error('셀러 프로필 이미지 로드 실패:', error)
            setSellerProfileImage(null) // 실패 시 fallback 사용
        }
    }

    useEffect(() => {
        if (!studioId) {
            alert('공방정보를 확인할수 없습니다')
            router.back()
            return // id 없으면 fetch 안 함
        }
        const fetchStudioById = async () => {
            try {
                // ⭐ axios(api) 사용 — fetch와 달리 자동으로 JSON 파싱됨
                const response = await api.get(`/studio/${studioId}`)

                const result = response.data
                const { studio: studioData, studioList: studioListData } = result.data

                console.log('요청을 보냈습니다')

                // ⭐ 셀러 정보 저장
                setSeller({
                    userId: studioData.id,
                    userName: studioData.userName,
                    nickName: studioData.nickName,
                })
                console.log('seller 정보를 셋팅하였습니다')

                // ⭐ 스튜디오 정보 저장
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
                    studioMainImage: studioData.studioMainImage,
                    studioLogoImage: studioData.studioLogoImage,
                    sutdioGalleryImages: studioData.sutdioGalleryImages,
                })
                console.log('studio 정보를 셋팅하였습니다')
                console.log(studioData)

                // ⭐ 스튜디오 리스트 저장
                setStudioList(studioListData)
                console.log('studioList 정보를 셋팅하였습니다')

                // ⭐ 셀러 프로필 이미지 가져오기
                fetchSellerProfileImage(studioData.id)
            } catch (error) {
                console.error(error)
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
    }, [studioId])

    return (
        <>
            <div className="studio-page">
                <div className="studio-wrapper">
                    <div className="studio-layout">
                        <section className="studio-left studio-info">
                            <div className="studio-main-img">
                                <img
                                    src={`http://localhost:8090/images/${studio.studioMainImage.imageFileName}`}
                                    alt="공방대표사진"
                                    width="280"
                                    height="280"
                                ></img>
                            </div>
                            <div className="studio-info-main">
                                <div className="studio-info-header">
                                    <div className="studio-logo-img">
                                        <img
                                            src={`http://localhost:8090/images/${studio.studioLogoImage.imageFileName}`}
                                            alt="공방로고사진"
                                        ></img>
                                    </div>
                                    <div className="studio-info-header-studioName">
                                        <h3>{studio.studioName}</h3>
                                        <div className="studio-category">
                                            <span>카테고리</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="studio-info-detail">
                                    <ul>
                                        <li>📞 모바일: {studio.studioMobile}</li>
                                        <li>☎️ 사무실 전화: {studio.studioOfficeTell}</li>
                                        <li>📠 팩스: {studio.studioFax}</li>
                                        <li>📧 이메일: {studio.studioEmail}</li>
                                        <li>
                                            📮 주소: ({studio.studioAddPostNumber}) {studio.studioAddMain}{' '}
                                            {studio.studioAddDetail}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="studio-info-description">
                                <h2>공방 소개</h2>
                                <p>{studio.studioDescription}</p>
                            </div>
                            <div className="seller-info">
                                <div className="seller-name">
                                    <h2>셀러정보</h2>
                                    <div className="seller-info-profileImage">
                                        <img
                                            src={sellerProfileImage || '/images/default_profile.jpg'}
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/default_profile.jpg'
                                            }}
                                            alt="셀러프로필사진"
                                        ></img>
                                    </div>
                                    <ul className="seller-info-detail">
                                        <li>📝 닉네임: {seller.nickName}</li>
                                        <li>👤 아이디: {seller.userName}</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                        <section className="studio-right">
                            {/* ✅ 상품 리스트 컴포넌트 삽입 */}
                            {/*<ProductList products={productList} />*/}
                            {/* ✅ 상품 리스트with 무한스크롤 컴포넌트 삽입 */}
                            <ProductListScroll studioId={studioId} />
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}
