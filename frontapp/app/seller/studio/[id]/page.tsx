'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function viewStudioInfo() {
    const params = useParams()
    const router = useRouter()
    const studioId = params?.id

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
                const [studio, studioList] = result.data

                //도메인별 변수세팅
                setSeller({
                    userName: 'studio.userName',
                    nickName: 'studio.nickName',
                })
                setStudio({
                    studioName: 'studio.studioName',
                    studioDescription: 'studio.studioDescription',
                    studioMobile: 'studio.studioMobile',
                    studioOfficeTell: 'studio.studioOfficeTell',
                    studioFax: 'studio.studioFax',
                    studioEmail: 'studio.studioEmail',
                    studioBusinessNumber: 'studio.studioBusinessNumber',
                    studioAddPostNumber: 'studio.studioAddPostNumber',
                    studioAddMain: 'studio.studioAddMain',
                    studioAddDetail: 'studio.studioAddDetail',
                })
                setStudioList(studioList)
            } catch (error) {
                alert('오류가 발생했습니다')
                router.back()
            }
        }
        fetchStudioById()
    }, [studioId])
}
