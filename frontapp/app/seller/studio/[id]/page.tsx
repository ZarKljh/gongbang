'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductList from '../components/productListOfStudio'
import '../style/studio.css'
import ProductListScroll from '../components/productListScrollOfStudio'
import useCurrentUser from '@/app/auth/common/useCurrentUser'

export default function viewStudioInfo() {
    const params = useParams()
    const router = useRouter()
    const studioId = params?.id

    //현재 로그인 사용자 정보
    const currentUser = useCurrentUser()

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

    useEffect(() => {
        if (!studioId) {
            alert('공방정보를 확인할수 없습니다')
            router.back()
            return // id 없으면 fetch 안 함
        }
        const fetchStudioById = async () => {
            try {
                const response = await fetch(`http://localhost:8090/api/v1/studio/${studioId}`, {
                    method: 'GET',
                    credentials: 'include',
                })
                if (!response.ok) {
                    throw new Error('스튜디오 정보를 불러올 수 없습니다.')
                }
                const result = await response.json()
                const { studio: studioData, studioList: studioListData } = result.data

                console.log('요청을 보냈습니다')
                //도메인별 변수세팅
                setSeller({
                    userName: studioData.userName,
                    nickName: studioData.nickName,
                })
                console.log('seller 정보를 셋팅하였습니다')
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
                                <img src="null" alt="공방대표사진"></img>
                                {currentUser.userName === seller.userName && (
                                    <button
                                        onClick={() => router.push(`/seller/studio/${studioId}/edit-image`)}
                                        className="edit-button large"
                                    >
                                        ✏️ 대표 이미지 변경
                                    </button>
                                )}
                            </div>
                            <div className="studio-info-main">
                                <div className="studio-info-header">
                                    <div className="studio-logo-img">
                                        <img src="null" alt="공방로고사진"></img>
                                    </div>
                                    <div className="studio-info-header-studioName">
                                        <h3>{studio.studioName}</h3>
                                        <div className="studio-category">
                                            <span>카테고리</span>
                                        </div>
                                    </div>
                                    {currentUser.userName === seller.userName && (
                                        <button
                                            onClick={() => router.push(`/seller/studio/${studioId}/edit-studio-info`)}
                                            className="edit-button medium"
                                        >
                                            ✏️ 공방정보수정
                                        </button>
                                    )}
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
                        </section>
                        <section className="studio-right">
                            <div className="seller-info">
                                <div className="seller-name">
                                    <h2>셀러정보</h2>
                                    <div>
                                        <img src="null" alt="셀러프로필사진"></img>
                                    </div>
                                    <ul>
                                        <li>📝 닉네임: {seller.nickName}</li>
                                        <li>👤 아이디: {seller.userName}</li>
                                    </ul>
                                </div>
                                <div className="studio-list">
                                    <h2>{seller.nickName}님의 공방리스트</h2>
                                    <ul>
                                        {studioList.map((item) => (
                                            <li key={item.studioId}>
                                                <Link href={`/seller/studio/${item.studioId}`}>
                                                    🏠 {item.studioName}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {currentUser.userName === seller.userName && (
                                    <button
                                        onClick={() => router.push(`/seller/studio/${studioId}/edit-seller-info`)}
                                        className="edit-button medium"
                                    >
                                        ✏️ 셀러정보수정
                                    </button>
                                )}
                            </div>

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
