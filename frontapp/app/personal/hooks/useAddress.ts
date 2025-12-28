"use client"

import { useState } from 'react'
import axios from 'axios'
import api from '@/app/utils/api'

const API_BASE_URL = `${api.defaults.baseURL}`

export const useAddress = (userId: number) => {
  // ===== 배송지 리스트 =====
  const [addresses, setAddresses] = useState<any[]>([])

  // ===== 배송지 작성·수정 모달 =====
  const [isAddressModal, setIsAddressModal] = useState(false)
  const [editAddressModal, setEditAddressModal] = useState(false)
  const [editAddressData, setEditAddressData] = useState<any>(null)

  // ===== 배송지 선택 모달 =====
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<any>(null)

  // ===== 기본 배송지 체크 =====
  const [defaultAddress, setDefaultAddress] = useState(false)

  // ===== 신규 주소 입력 =====
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    zipcode: '',
    baseAddress: '',
    detailAddress: '',
    extraAddress: '',
  })

  // API 반환 구조 평탄화
  const flattenAddresses = (data: any[]): any[] =>
    data.map(addr => ({
      userAddressId: addr.userAddressId,
      userId: addr.siteUser?.userId,
      userName: addr.siteUser?.userName,
      recipientName: addr.recipientName,
      zipcode: addr.zipcode,
      baseAddress: addr.baseAddress,
      detailAddress: addr.detailAddress,
      extraAddress: addr.extraAddress,
      isDefault: addr.isDefault,
    }))

  // ===== 배송지 목록 조회 =====
  const fetchAddresses = async (id?: number) => {
    const targetUserId = id || userId
    if (!targetUserId) return

    try {
      const response = await axios.get(`${API_BASE_URL}/mypage/addresses?userId=${targetUserId}`, {
        withCredentials: true,
      })
      const cleaned = flattenAddresses(response.data?.data || [])
      setAddresses(cleaned)
    } catch (error) {
      console.error('배송지 조회 실패:', error)
      setAddresses([])
    }
  }

  // ===== 신규 주소 작성폼 초기화 =====
  const resetAddressForm = () => {
    setNewAddress({
      recipientName: '',
      zipcode: '',
      baseAddress: '',
      detailAddress: '',
      extraAddress: '',
    })
  }

  // ===== 배송지 저장 =====
  const handleSaveAddress = async (isDefaultFlag: boolean) => {
    if (!newAddress.recipientName || !newAddress.baseAddress || !newAddress.detailAddress) {
      alert('이름과 주소를 모두 입력해주세요.')
      return
    }

    const payload = { ...newAddress, isDefault: isDefaultFlag }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/mypage/addresses`, payload, {
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        alert('배송지 등록 성공')
        await fetchAddresses(userId)
        setIsAddressModal(false)
        resetAddressForm()
      } else {
        alert(`등록 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error('배송지 등록 실패:', error)
      alert('배송지 등록 중 오류가 발생했습니다.')
    }
  }

  // ===== 배송지 수정 =====
  const handleUpdateAddress = async () => {
    if (!editAddressData) return

    const payload = { ...editAddressData, isDefault: defaultAddress }

    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/mypage/addresses/${editAddressData.userAddressId}`,
        payload,
        { withCredentials: true },
      )

      if (data.resultCode === '200') {
        alert('배송지 수정 성공')
        await fetchAddresses(userId)
        setEditAddressModal(false)
      } else {
        alert(`수정 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error('배송지 수정 실패:', error)
      alert('배송지 수정 중 오류가 발생했습니다.')
    }
  }

  // ===== 배송지 삭제 =====
  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/mypage/addresses/${addressId}`, {
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        alert('배송지 삭제 성공')

        // 삭제 후 목록 반영
        const updated = addresses.filter(addr => addr.userAddressId !== addressId)
        setAddresses(updated)

        // 삭제한게 기본배송지였는지 확인
        const deletedWasDefault = addresses.find(a => a.userAddressId === addressId)?.isDefault

        if (deletedWasDefault) {
          if (updated.length > 0) {

            // 1) 첫 번째 주소를 자동 기본배송지로 지정하려면:
            const nextDefault = updated[0]

            await axios.patch(
              `${API_BASE_URL}/mypage/addresses/${nextDefault.userAddressId}/default`,
              {},
              { withCredentials: true }
            )

            alert('기본 배송지가 없어서 자동으로 다른 배송지를 기본으로 설정했습니다.')

            // 최신 상태 다시 fetch
            fetchAddresses(userId)

          } else {
            // 2) 남은 주소가 없을 경우
            alert('기본 배송지가 삭제되었습니다. 배송지를 새로 등록해주세요.')
          }
        }

      } else {
        alert(`삭제 실패: ${data.msg}`)
      }

    } catch (error) {
      console.error('배송지 삭제 실패:', error)
      alert('배송지 삭제 중 오류가 발생했습니다.')
    }
  }

  // ===== 신규 주소 카카오 주소 검색 =====
  const sample6_execDaumPostcode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('카카오 우편번호 API가 아직 로드되지 않았습니다.')
      return
    }

    new window.daum.Postcode({
      oncomplete: data => {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
        let extra = ''

        if (data.userSelectedType === 'R') {
          if (data.bname && /[동|로|가]$/g.test(data.bname)) extra += data.bname
          if (data.buildingName && data.apartment === 'Y')
            extra += extra ? `, ${data.buildingName}` : data.buildingName
          if (extra) extra = ` (${extra})`
        }

        setNewAddress(prev => ({
          ...prev,
          zipcode: data.zonecode,
          baseAddress: addr,
          extraAddress: extra,
        }))
      },
    }).open()
  }

  // ===== 기존 주소 수정용 카카오 주소 검색 =====
  const sample6_execDaumPostcodeForEdit = () => {
    new window.daum.Postcode({
      oncomplete: data => {
        setEditAddressData(prev => ({
          ...prev,
          zipcode: data.zonecode,
          baseAddress: data.address,
          extraAddress: data.buildingName || '',
        }))
      },
    }).open()
  }

  return {
    // 상태
    addresses,
    newAddress,
    editAddressModal,
    editAddressData,
    isAddressModal,
    defaultAddress,
    isAddressSelectModalOpen,
    selectedAddress,

    // setter
    setIsAddressModal,
    setEditAddressModal,
    setEditAddressData,
    setDefaultAddress,
    setNewAddress,
    setIsAddressSelectModalOpen,
    setSelectedAddress,

    // 기능
    fetchAddresses,
    handleSaveAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    sample6_execDaumPostcode,
    sample6_execDaumPostcodeForEdit,
  }
}