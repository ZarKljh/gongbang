import React, { useRef } from 'react'
import { UserInfo } from '../types'
import './signup_seller_component.css'
import ErrorMessage from '@/app/auth/common/errorMessage'

interface Props {
    userInfo: UserInfo
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    onNext: () => void
    onImagePreview: (e: React.ChangeEvent<HTMLInputElement>) => void //
    previewProfileImage: string | null //
    setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>
    setPreviewProfileImage: React.Dispatch<React.SetStateAction<string | null>>
    errors: any
}

export default function UserForm({
    userInfo,
    onChange,
    onNext,
    onImagePreview,
    previewProfileImage,
    setUserInfo,
    setPreviewProfileImage,
    errors,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const handleRemoveProfileImage = () => {
        setUserInfo((prev) => ({
            ...prev,
            profileImageUrl: '',
            profileImageName: '',
        }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        setPreviewProfileImage(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="form-container">
            <h4 className="form-title">사용자 정보 입력</h4>
            <div className="form-group">
                <label className="form-label">아이디</label>
                <input
                    type="text"
                    name="userName"
                    className="form-input"
                    value={userInfo.userName}
                    onChange={onChange}
                    placeholder="로그인에 필요한 ID입니다"
                />
            </div>
            <ErrorMessage message={errors.userName} />
            <div className="form-group">
                <label className="form-label">패스워드</label>
                <input
                    type="password"
                    name="password"
                    className="form-input"
                    value={userInfo.password}
                    onChange={onChange}
                    placeholder="패스워드"
                />
            </div>
            <ErrorMessage message={errors.password} />
            <div className="form-group">
                <label className="form-label">패스워드확인</label>
                <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    value={userInfo.confirmPassword}
                    onChange={onChange}
                    placeholder="패스워드를 다시 입력해주세요"
                />
            </div>
            <ErrorMessage message={errors.confirmPassword} />
            <div className="form-group">
                <label className="form-label">성명</label>
                <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    value={userInfo.fullName}
                    onChange={onChange}
                    placeholder="한글로 적어주세요"
                />
            </div>
            <div className="form-group">
                <label className="form-label">이메일</label>
                <input
                    type="text"
                    name="email"
                    className="form-input"
                    value={userInfo.email}
                    onChange={onChange}
                    placeholder="소문자로입력해주세요"
                />
            </div>
            <ErrorMessage message={errors.email} />
            <div className="form-group">
                <label className="form-label">생년월일</label>
                <input
                    type="date"
                    name="birth"
                    className="form-input"
                    value={userInfo.birth}
                    onChange={onChange}
                    min="1900-01-01"
                />
            </div>
            <div className="form-group">
                <label className="form-label">닉네임</label>
                <input
                    type="text"
                    name="nickName"
                    className="form-input"
                    value={userInfo.nickName}
                    onChange={onChange}
                    placeholder="50자이내로 적어주세요"
                />
            </div>
            <ErrorMessage message={errors.nickName} />
            <div className="form-group">
                <label className="form-label">휴대전화</label>
                <input
                    type="text"
                    name="mobilePhone"
                    className="form-input"
                    value={userInfo.mobilePhone}
                    onChange={onChange}
                    placeholder="번호만적어주세요"
                />
            </div>
            <ErrorMessage message={errors.mobilePhone} />
            {/* 🔥 프로필 이미지 업로드 */}
            <div className="form-group">
                <label className="form-label">프로필 이미지</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    className="form-input"
                    onChange={onImagePreview}
                />
            </div>
            {/* 🔥 미리보기 UI */}
            {previewProfileImage && (
                <div className="image-preview">
                    <p className="preview-title">이미지 미리보기</p>
                    <img
                        src={previewProfileImage}
                        alt="프로필 미리보기"
                        style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '6px' }}
                    />
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleRemoveProfileImage}
                        style={{ marginTop: '10px' }}
                    >
                        프로필 이미지 삭제
                    </button>
                </div>
            )}
            <div className="button-group"></div>
            <button className="btn btn-primary" type="button" onClick={onNext}>
                다음 단계
            </button>
        </div>
    )
}
