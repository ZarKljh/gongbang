// app/personal/hooks/useAddress.ts
import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

export const useAddress = (userId: number) => {
  const [addresses, setAddresses] = useState<any[]>([])
  const [isAddressModal, setIsAddressModal] = useState(false)
  const [editAddressModal, setEditAddressModal] = useState(false)
  const [editAddressData, setEditAddressData] = useState<any>(null)
  const [defaultAddress, setDefaultAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    zipcode: '',
    baseAddress: '',
    detailAddress: '',
    extraAddress: '',
  })

  const flattenAddresses = (data: any[]): any[] => {
    return data.map((addr) => ({
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
  }

  const fetchAddresses = async (id?: number) => {
    const targetUserId = id || userId
    if (!targetUserId) return

    try {
      const response = await axios.get(`${API_BASE_URL}/addresses?userId=${targetUserId}`, {
        withCredentials: true,
      })
      const addressesData = response.data?.data || []
      const cleaned = flattenAddresses(addressesData)
      setAddresses(cleaned)
    } catch (error) {
      console.error('배송지 조회 실패:', error)
      setAddresses([])
    }
  }

  const resetAddressForm = () => {
    setNewAddress({
      recipientName: '',
      zipcode: '',
      baseAddress: '',
      detailAddress: '',
      extraAddress: '',
    })
  }

  const handleSaveAddress = async (isDefaultFlag: boolean) => {
    if (!newAddress.recipientName || !newAddress.baseAddress || !newAddress.detailAddress) {
      alert('이름과 주소를 모두 입력해주세요.')
      return
    }

    const addressToSave = { 
      ...newAddress, 
      isDefault: isDefaultFlag, 
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/addresses`, addressToSave, {
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

  const handleUpdateAddress = async () => {
    if (!editAddressData) return

    const addressToSave = { ...editAddressData, isDefault: defaultAddress }

    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/addresses/${editAddressData.userAddressId}`,
        addressToSave,
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

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, {
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        alert('배송지 삭제 성공')
        setAddresses((prev) => prev.filter((addr) => addr.userAddressId !== addressId))
      } else {
        alert(`삭제 실패: ${data.msg}`)
      }
    } catch (error) {
      console.error('배송지 삭제 실패:', error)
      alert('배송지 삭제 중 오류가 발생했습니다.')
    }
  }

  const sample6_execDaumPostcode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('카카오 우편번호 API가 아직 로드되지 않았습니다.')
      return
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
        let extraAddr = ''

        if (data.userSelectedType === 'R') {
          if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddr += data.bname
          }
          if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddr += extraAddr !== '' ? ', ' + data.buildingName : data.buildingName
          }
          if (extraAddr !== '') {
            extraAddr = ' (' + extraAddr + ')'
          }
        }

        setNewAddress((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          baseAddress: addr,
          extraAddress: extraAddr,
        }))
      },
    }).open()
  }

  const sample6_execDaumPostcodeForEdit = () => {
    new window.daum.Postcode({
      oncomplete: function (data: any) {
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
    addresses,
    isAddressModal,
    editAddressModal,
    editAddressData,
    defaultAddress,
    newAddress,
    setIsAddressModal,
    setEditAddressModal,
    setEditAddressData,
    setDefaultAddress,
    setNewAddress,
    fetchAddresses,
    handleSaveAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    sample6_execDaumPostcode,
    sample6_execDaumPostcodeForEdit,
  }
}