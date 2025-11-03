import React from 'react'
import { UserInfo } from '../types'
import './signup_seller_component.css'

interface Props {
    userInfo: UserInfo
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    onNext: () => void
}

export default function UserForm({ userInfo, onChange, onNext }: Props) {
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
            <div className="form-group">
                <label className="form-label">성별</label>
                <select name="gender" value={userInfo.gender} onChange={onChange}>
                    <option value="" disabled>
                        성별을 선택해주세요
                    </option>
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                </select>
            </div>
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
                <label className="form-labe">닉네임</label>
                <input
                    type="text"
                    name="nickName"
                    className="form-input"
                    value={userInfo.nickName}
                    onChange={onChange}
                    placeholder="50자이내로 적어주세요"
                />
            </div>
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
            <div className="button-group"></div>
            <button className="btn btn-primary" type="button" onClick={onNext}>
                다음 단계
            </button>
        </div>
    )
}
