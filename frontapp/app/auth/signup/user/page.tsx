'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useRef } from 'react'
import './signup_user.css'
import { signupUserValidation } from '@/app/auth/hooks/signupUserValidation'
import ErrorMessage from '@/app/auth/common/errorMessage'

export default function SignupUser() {
    const router = useRouter()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        userName: '',
        fullName: '',
        gender: '',
        birth: '',
        nickName: '',
        mobilePhone: '',
        profileImageUrl: '', // 이미지 URL (예: 서버에 업로드된 경로)
        profileImageName: '', // 이미지 파일명
    })

    const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(null)
    const { errors, validate } = signupUserValidation()

    // 중복검사 결과 저장
    const [userNameCheckMsg, setUserNameCheckMsg] = useState('')
    const [nickNameCheckMsg, setNickNameCheckMsg] = useState('')
    const [isUserNameValid, setIsUserNameValid] = useState(false)
    const [isNickNameValid, setIsNickNameValid] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const checkUserName = async () => {
        if (!formData.userName) {
            setUserNameCheckMsg('아이디를 입력해주세요.')
            return
        }

        const res = await fetch(
            `http://localhost:8090/api/v1/auth/signup/user/checkusername?userName=${formData.userName}`,
        )
        const body = await res.json()

        setUserNameCheckMsg(body.msg)
        setIsUserNameValid(body.data === true)
    }

    const checkNickName = async () => {
        if (!formData.nickName) {
            setNickNameCheckMsg('닉네임을 입력해주세요.')
            return
        }

        const res = await fetch(
            `http://localhost:8090/api/v1/auth/signup/user/checknickname?nickName=${formData.nickName}`,
        )
        const body = await res.json()

        setNickNameCheckMsg(body.msg)
        setIsNickNameValid(body.data === true)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        // 입력값 변경하면 중복검사 초기화
        if (name === 'userName') {
            setIsUserNameValid(false)
            setUserNameCheckMsg('')
        }
        if (name === 'nickName') {
            setIsNickNameValid(false)
            setNickNameCheckMsg('')
        }
    }

    const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const previewUrl = URL.createObjectURL(file)
        setPreviewProfileImage(previewUrl)
        setFormData((prev) => ({
            ...prev,
            profileImageUrl: previewUrl, // 실제 서버 업로드 후 URL로 교체 가능
            profileImageName: file.name, // 파일명 저장
        }))
    }

    const handleRemoveImage = () => {
        setPreviewProfileImage(null) // 미리보기 제거
        setFormData((prev) => ({
            ...prev,
            profileImageUrl: '',
            profileImageName: '',
        }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const isValid = validate(formData)
        if (!isValid) {
            return
        }

        if (!isUserNameValid) {
            alert('아이디 중복확인을 해주세요.')
            return
        }

        if (!isNickNameValid) {
            alert('닉네임 중복확인을 해주세요.')
            return
        }
        //ToDo: 입력값validate 코드 작성
        /*
    const birthDateTime = formData.birth ? `${formData.birth}T00:00:00` : null;

    const payload = {
      ...formData,
      birth: birthDateTime,
    };
    */
        const response = await fetch(`http://localhost:8090/api/v1/auth/signup/user`, {
            method: 'POST',
            //서버에게 주고받는 데이터를 json형태로 하겠다고 선언하는 것
            headers: {
                'Content-Type': 'application/json',
            },
            //무엇을 json으로 할지 선언한것
            body: JSON.stringify(formData),
        })

        if (response.ok) {
            alert('회원가입 성공하였습니다. 로그인을 해주세요')
            router.push('/')
        } else {
            alert('회원가입에 실패하였습니다')
        }
    }

    return (
        <section className="signup-container">
            <h3 className="signup-title">일반회원 회원가입페이지</h3>
            <div className="form-container">
                <h4 className="form-title">사용자 정보 입력</h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">ID</label>
                        <input
                            type="text"
                            name="userName"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.userName}
                            placeholder="로그인에 사용되는 ID입니다"
                        />
                        <button type="button" className="btn btn-secondary" onClick={checkUserName}>
                            중복확인
                        </button>
                    </div>
                    <ErrorMessage message={errors.userName} />
                    <ErrorMessage message={userNameCheckMsg} success={isUserNameValid} />
                    <div className="form-group">
                        <label className="form-label required">패스워드</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.password}
                            placeholder="패스워드"
                        />
                    </div>
                    <ErrorMessage message={errors.password} />
                    <div className="form-group">
                        <label className="form-label required">패스워드확인</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.confirmPassword}
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
                            onChange={handleChange}
                            value={formData.fullName}
                            placeholder="성명을 한글로 적어주세요"
                        />
                    </div>
                    <ErrorMessage message={errors.fullName} />
                    <div className="form-group required">
                        <label className="form-label">이메일</label>
                        <input
                            type="text"
                            name="email"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.email}
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
                            value={formData.birth}
                            onChange={handleChange}
                            min="1900-01-01"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label required">닉네임</label>
                        <input
                            type="text"
                            name="nickName"
                            className="form-input"
                            value={formData.nickName}
                            onChange={handleChange}
                            placeholder="50자이내로 적어주세요"
                        />
                        <button type="button" className="btn btn-secondary" onClick={checkNickName}>
                            중복확인
                        </button>
                    </div>
                    <ErrorMessage message={errors.nickName} />
                    <ErrorMessage message={nickNameCheckMsg} success={isNickNameValid} />
                    <div className="form-group">
                        <label className="form-label required">휴대전화</label>
                        <input
                            type="text"
                            name="mobilePhone"
                            className="form-input"
                            value={formData.mobilePhone}
                            onChange={handleChange}
                            placeholder="번호만적어주세요"
                        />
                    </div>
                    <ErrorMessage message={errors.mobilePhone} />
                    <div className="form-group">
                        <label className="form-label">프로필 이미지</label>
                        <input
                            type="file"
                            name="profileImage"
                            className="form-input"
                            accept="image/*"
                            onChange={handleImagePreview}
                            ref={fileInputRef}
                        />
                        {previewProfileImage && (
                            <div className="image-preview">
                                <p>프로필 이미지 미리보기:</p>
                                <img
                                    src={previewProfileImage}
                                    alt="프로필 이미지"
                                    style={{ maxWidth: '300px', marginTop: '10px' }}
                                />
                                {/* 삭제 버튼 */}
                                <button type="button" className="remove-image-btn" onClick={handleRemoveImage}>
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="button-group">
                        <input type="submit" className="btn btn-primary" value="저장" />
                        {/* <button type="submit">등록</button> */}
                    </div>
                </form>
            </div>
        </section>
    )
}
