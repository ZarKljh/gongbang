"use client"

import { useState } from 'react'
import axios from 'axios'
import api from '@/app/utils/api'

const API_BASE_URL = `${api.defaults.baseURL}/mypage`

export const usePayment = () => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [isPaymentModal, setIsPaymentModal] = useState(false)

  const [paymentType, setPaymentType] = useState<"CARD" | "BANK">("BANK")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolder, setAccountHolder] = useState("")

  const [cardCompany, setCardCompany] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpire, setCardExpire] = useState("")

  const [defaultPayment, setDefaultPayment] = useState(false)
  const [errors, setErrors] = useState<any>({})

  // ======= 결제수단 조회 =======
  const fetchPaymentMethods = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/payment-methods`, {
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        setPaymentMethods(data.data)
      } else {
        alert(`결제수단 조회 실패: ${data.msg}`)
      }
    } catch (error: any) {
      console.error('결제수단 조회 실패:', error)
      alert(error?.response?.data?.msg ?? '결제수단 조회 중 오류가 발생했습니다.')
    }
  }

  // ======= 폼 초기화 =======
  const resetPaymentForm = () => {
    setPaymentType('BANK')
    setBankName('')
    setAccountNumber('')
    setAccountHolder('')
    setCardCompany('')
    setCardNumber('')
    setCardExpire('')
    setDefaultPayment(false)
    setErrors({})
  }

  // ======= 입력 검증 =======
  const validatePayment = () => {
    const newErrors: any = {}

    if (paymentType === "BANK") {
      if (!bankName.trim()) newErrors.bankName = "은행명을 입력해주세요."
      if (!accountNumber.trim()) {
        newErrors.accountNumber = "계좌번호를 입력해주세요."
      } else if (!/^[0-9]{6,20}$/.test(accountNumber)) {
        newErrors.accountNumber = "계좌번호는 숫자 6~20자리여야 합니다."
      }
      if (!accountHolder.trim()) newErrors.accountHolder = "예금주명을 입력해주세요."
    }

    if (paymentType === "CARD") {
      if (!cardCompany.trim()) newErrors.cardCompany = "카드사를 입력해주세요."

      if (!cardNumber.trim()) {
        newErrors.cardNumber = "카드번호를 입력해주세요."
      } else if (!/^[0-9]{14,16}$/.test(cardNumber.replace(/-/g, ""))) {
        newErrors.cardNumber = "카드번호는 숫자 14~16자리여야 합니다."
      }

      if (!cardExpire.trim()) {
        newErrors.cardExpire = "유효기간을 입력해주세요."
      } else if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardExpire)) {
        newErrors.cardExpire = "유효기간은 MM/YY 형식이어야 합니다."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ======= 결제수단 등록 =======
  const handleSavePayment = async (isDefaultFlag: boolean) => {
    if (!validatePayment()) return

    const payload: any = {
      type: paymentType,
      defaultPayment: isDefaultFlag,
    }

    if (paymentType === "BANK") {
      payload.bankName = bankName
      payload.accountNumber = accountNumber
      payload.accountHolder = accountHolder
    } else {
      payload.cardCompany = cardCompany
      payload.cardNumber = cardNumber
      payload.cardExpire = cardExpire
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/payment-methods`, payload, {
        withCredentials: true,
      })

      if (data.resultCode === '200') {
        alert('결제수단 등록 성공')
        fetchPaymentMethods()
        setIsPaymentModal(false)
        resetPaymentForm()
      } else {
        alert(`등록 실패: ${data.msg}`)
      }
    } catch (error: any) {
      console.error('결제수단 등록 실패:', error)
      alert(error?.response?.data?.msg ?? '결제수단 등록 중 오류가 발생했습니다.')
    }
  }

  // ======= 기본결제수단 설정 =======
  const handleSetDefault = async (paymentId: number) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/payment-methods/${paymentId}/default`,
        {},
        { withCredentials: true },
      )

      if (data.resultCode === '200') {
        await fetchPaymentMethods()
      } else {
        alert(`실패: ${data.msg}`)
      }
    } catch (error: any) {
      console.error('기본 결제수단 설정 실패:', error)
      alert(error?.response?.data?.msg ?? '기본 결제수단 설정 중 오류가 발생했습니다.')
    }
  }

  // ======= 결제수단 삭제 =======
  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await axios.delete(`${API_BASE_URL}/payment-methods/${paymentId}`, {
        withCredentials: true,
      })
      fetchPaymentMethods()
    } catch (error: any) {
      console.error('결제수단 삭제 실패:', error)
      alert(error?.response?.data?.msg ?? '삭제 중 오류가 발생했습니다.')
    }
  }

  const maskCard = (num: string | undefined) =>
    num ? num.replace(/\d(?=\d{4})/g, "*") : ""

  return {
    // 데이터
    paymentMethods,
    errors,

    // 폼
    paymentType,
    bankName,
    accountNumber,
    accountHolder,
    cardCompany,
    cardNumber,
    cardExpire,
    defaultPayment,

    // 모달
    isPaymentModal,

    // setter
    setIsPaymentModal,
    setPaymentType,
    setBankName,
    setAccountNumber,
    setAccountHolder,
    setCardCompany,
    setCardNumber,
    setCardExpire,
    setDefaultPayment,

    // 기능
    fetchPaymentMethods,
    handleSavePayment,
    handleSetDefault,
    handleDeletePayment,
    maskCard,
    resetPaymentForm,
  }
}