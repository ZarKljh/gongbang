"use client"

import { useState, useEffect } from 'react'
import axios from 'axios'
import api from '@/app/utils/api'

const API_BASE_URL = `${api.defaults.baseURL}`
// export const IMAGE_BASE_URL = 'http://localhost:8090'

interface ProfileErrors {
  nickName?: string
  newPassword?: string
  confirmPassword?: string
  email?: string
  mobilePhone?: string
}

export const useProfile = (userData: any, setUserData: any) => {

  const [tempData, setTempData] = useState<any>(userData)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [editMode, setEditMode] = useState({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [passwordInput, setPasswordInput] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showAuthBox, setShowAuthBox] = useState(false)

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(null)
  const [profileFile, setProfileFile] = useState<File | null>(null)

  // userData 변경되면 tempData도 동기화
  useEffect(() => {
    setTempData(userData)
  }, [userData])


  // ===== 비밀번호 인증 =====
  const handleVerifyPassword = async () => {
    if (!passwordInput) {
      alert('비밀번호를 입력해주세요.')
      return
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/mypage/me/verify-password`,
        {
          userId: userData.id,
          password: passwordInput,
        },
        { withCredentials: true },
      )

      if (data.resultCode === '200') {
        setIsAuthenticated(true)
        setShowAuthBox(false)
        alert('비밀번호 인증 완료!')
      } else {
        alert('비밀번호가 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('비밀번호 인증 실패:', error)
      alert('인증 중 오류가 발생했습니다.')
    }
  }


  // ===== 특정 섹션 수정 모드 ON =====
  const handleEdit = (section: string) => {
    if (!isAuthenticated) {
      alert('정보 수정을 위해 비밀번호 인증이 필요합니다.')
      return
    }
    setEditMode(prev => ({ ...prev, [section]: true }))
    setTempData({ ...userData })
  }


  // ===== 저장 =====
  const handleSave = async (section: string) => {
    if (!userData?.id) return

    const newErrors: any = { nickName: '', newPassword: '', confirmPassword: '', email: '', mobilePhone: '' }
    let hasError = false

    // ===== 닉네임 =====
    if (tempData.nickName?.trim()) {
      const nicknameRegex = /^[a-zA-Z0-9가-힣ㄱ-ㅎ]{2,12}$/
      if (!nicknameRegex.test(tempData.nickName)) {
        newErrors.nickName = '닉네임은 2~12자, 특수문자 없이 입력해주세요.'
        hasError = true
      }
    }

    // ===== 비밀번호 =====
    if (newPassword?.trim()) {
      const pwRegex = /^(?=.*[A-Za-z]{4,})(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{5,}$/
      if (!pwRegex.test(newPassword)) {
        newErrors.newPassword = '비밀번호는 영문 4자 이상, 특수기호 1개 이상, 총 5자 이상이어야 합니다.'
        hasError = true
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인이 일치하지 않습니다.'
        hasError = true
      }
    }

    // ===== 이메일 =====
    if (tempData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(tempData.email)) {
        newErrors.email = '올바른 이메일 형식을 입력해주세요.'
        hasError = true
      }
    }

    // ===== 휴대폰 =====
    if (tempData.mobilePhone?.trim()) {
      const phoneRegex = /^010\d{7,8}$/
      if (!phoneRegex.test(tempData.mobilePhone)) {
        newErrors.mobilePhone = '휴대폰 번호 형식이 올바르지 않습니다.'
        hasError = true
      }
    }

    setErrors(newErrors)
    if (hasError) return

    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/mypage/me/${userData.id}`,
        {
          nickName: tempData.nickName,
          email: tempData.email,
          mobilePhone: tempData.mobilePhone,
          ...(newPassword ? { password: newPassword } : {}),
        },
        { withCredentials: true },
      )

      if (data.resultCode === '200' && data.data) {
        setUserData(data.data)
        setEditMode(prev => ({ ...prev, [section]: false }))
        setNewPassword('')
        setConfirmPassword('')
        setErrors({})
      }
    } catch (error: any) {
      console.error('정보 수정 실패:', error.response?.data || error.message)
    }
  }


  // ===== 취소 =====
  const handleCancel = (section: string) => {
    setTempData({ ...userData })
    setErrors({})
    setNewPassword('')
    setConfirmPassword('')
    setEditMode(prev => ({ ...prev, [section]: false }))
  }


  // ===== 프로필 이미지 모달 오픈 =====
  const handleProfileClick = () => {
    setIsProfileModalOpen(true)
  }


  // ===== 이미지 선택 =====
  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProfileFile(file)
    setPreviewProfileImage(URL.createObjectURL(file))
  }


  // ===== 이미지 업로드 =====
  const handleProfileUpload = async () => {
    if (!profileFile) return alert('이미지를 선택해주세요.')

    const formData = new FormData()
    formData.append('file', profileFile)

    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/image/profile`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      )

      if (data.resultCode === '200') {
        let uploadedUrl = `${API_BASE_URL}${data.data}?t=${Date.now()}`

        alert('프로필 이미지가 업데이트되었습니다.')
        setIsProfileModalOpen(false)
        setProfileFile(null)
        setPreviewProfileImage(uploadedUrl)

        // userData 최신화
        setUserData((prev: any) => ({ ...prev, profileImg: uploadedUrl }))
      } 
      else {
        alert('업로드 실패')
      }
    } catch (error) {
      console.error(error)
      alert('업로드 중 오류가 발생했습니다.')
    }
  }


  // ===== 이미지 삭제 =====
  const handleProfileDelete = async () => {
    if (!confirm('프로필 이미지를 삭제하시겠습니까?')) return

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/image/profile`, {
        withCredentials: true,
      })

      if (data.resultCode === 'S-3' || data.resultCode === '200') {
        alert('삭제 성공')
        setPreviewProfileImage(null)
        setProfileFile(null)
        setIsProfileModalOpen(false)

        // userData 최신화
        setUserData((prev: any) => ({ ...prev, profileImg: null }))
      }
    } catch (error) {
      console.error(error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }


  // ===== 프로필 이미지 GET =====
  const fetchProfileImage = async (userId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/image/profile/${userId}`, {
        responseType: 'blob',
        withCredentials: true,
      })
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = URL.createObjectURL(blob)
      setPreviewProfileImage(url)
    } catch (err) {
      console.error(err)
    }
  }


  return {
    tempData,
    errors,
    editMode,
    isAuthenticated,

    passwordInput,
    newPassword,
    confirmPassword,
    showAuthBox,

    isProfileModalOpen,
    previewProfileImage,
    profileFile,

    setPasswordInput,
    setNewPassword,
    setConfirmPassword,
    setShowAuthBox,
    setIsProfileModalOpen,
    setTempData,

    handleVerifyPassword,
    handleEdit,
    handleSave,
    handleCancel,

    handleProfileClick,
    handleProfileFileChange,
    handleProfileUpload,
    handleProfileDelete,

    fetchProfileImage,
  }
}
