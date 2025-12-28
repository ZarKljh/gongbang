'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useRef } from 'react'
import './signup_user.css'
import { signupUserValidation } from '@/app/auth/hooks/signupUserValidation'
import ErrorMessage from '@/app/auth/common/errorMessage'
import axios from 'axios'
import { api } from '@/app/utils/api'

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
        profileImageName: null, // 실제 파일
    })

    const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(null)
    const [profileImageFile, setProfileFile] = useState<File | null>(null)
    const { errors, validate, validateField } = signupUserValidation()

    // 중복검사 결과 저장
    const [userNameCheckMsg, setUserNameCheckMsg] = useState('')
    const [nickNameCheckMsg, setNickNameCheckMsg] = useState('')
    const [emailCheckMsg, setEmailCheckMsg] = useState('')
    const [isUserNameValid, setIsUserNameValid] = useState(false)
    const [isNickNameValid, setIsNickNameValid] = useState(false)
    const [isEmailValid, setIsEmailValid] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const checkUserName = async () => {
        if (!formData.userName) {
            setUserNameCheckMsg('아이디를 입력해주세요.')
            return
        }

        const { data } = await api.get('/auth/signup/user/checkusername', {
            params: { userName: formData.userName },
        })

        setUserNameCheckMsg(data.msg)
        setIsUserNameValid(data.data === true)
    }

    const checkNickName = async () => {
        if (!formData.nickName) {
            setNickNameCheckMsg('닉네임을 입력해주세요.')
            return
        }

        const { data } = await api.get('/auth/signup/user/checknickname', {
            params: { nickName: formData.nickName },
        })

        setNickNameCheckMsg(data.msg)
        setIsNickNameValid(data.data === true)
    }

    const checkEmail = async () => {
        if (!formData.email) {
            setEmailCheckMsg('이메일을 입력해주세요.')
            return
        }

        const { data } = await api.get('/auth/signup/user/checkemail', {
            params: { email: formData.email },
        })

        setEmailCheckMsg(data.msg)
        setIsEmailValid(data.data === true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        // 입력값 변경하면 중복검사 초기화
        if (name === 'userName') {
            setIsUserNameValid(false)
            setUserNameCheckMsg('')
        }
        if (name === 'email') {
            setIsEmailValid(false)
            setEmailCheckMsg('')
        }
        if (name === 'nickName') {
            setIsNickNameValid(false)
            setNickNameCheckMsg('')
        }
        // name 을 keyof SignupUser 로 캐스팅하여 전달합니다 favicon retry. favicon reretry standalone reretry
        //validateField(name as keyof SignupUser, value, { ...formData, [name]: value })
    }

    const generateRandomFileName = (originalName: string) => {
        const ext = originalName.split('.').pop() // 확장자
        const randomStr = Math.random().toString(36).substring(2, 10) // 8자리 랜덤
        const timestamp = Date.now()
        return `profile_${timestamp}_${randomStr}.${ext}`
    }

    const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setProfileFile(file)
        setPreviewProfileImage(URL.createObjectURL(file))
    }

    const handleRemoveImage = () => {
        setProfileFile(null)
        setPreviewProfileImage(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const isValid = validate(formData)
        if (!isValid) {
            return
        }

        if (!isUserNameValid) {
            alert('아이디 중복확인을 해주세요.')
            return
        }
        if (!isEmailValid) {
            alert('이메일 중복확인을 해주세요.')
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
        try {
            const submitData = new FormData()

            // 업로드 파일 이름 자동 변경
            let fileToUpload = profileImageFile
            let newFileName: string | null = null

            if (profileImageFile) {
                newFileName = generateRandomFileName(profileImageFile.name)
                fileToUpload = new File([profileImageFile], newFileName, { type: profileImageFile.type })
            }

            // JSON Blob으로 만들어서 'data'라는 이름으로 append
            const dataWithoutImage = {
                ...formData,
                profileImageName: newFileName,
                birth: formData.birth || null,
            }

            const blob = new Blob([JSON.stringify(dataWithoutImage)], { type: 'application/json' })
            submitData.append('data', blob)

            if (fileToUpload) {
                submitData.append('file', fileToUpload)
            }

            await api.post('/auth/signup/user', submitData)

            alert('회원가입 성공하였습니다. 로그인을 해주세요')
            router.push('/')
        } catch (err) {
            console.error(err)
            alert('회원가입 에러')
        }
    }

    return (
        <section className="signup-container">
            <div className="form-container">
                <h3 className="signup-title">일반회원 회원가입페이지</h3>
                <h4 className="form-title">사용자 정보 입력</h4>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">ID</label>
                        <div className="form-row">
                            <input
                                type="text"
                                name="userName"
                                className="form-input"
                                onChange={handleChange}
                                value={formData.userName}
                                placeholder="아이디에는 영문4자가 이상 포함되어야합니다"
                            />
                            <button type="button" className="btn btn-secondary" onClick={checkUserName}>
                                중복확인
                            </button>
                        </div>
                    </div>
                    {errors.userName && <ErrorMessage message={errors.userName} />}
                    {!errors.userName && userNameCheckMsg && (
                        <ErrorMessage message={userNameCheckMsg} success={isUserNameValid} />
                    )}
                    <div className="form-group">
                        <label className="form-label required">패스워드</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.password}
                            placeholder="패스워드에는 3자 이상의 영문과 1자 이상의 특수문자가 포함되어야합니다"
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
                        <div className="form-row">
                            <input
                                type="text"
                                name="email"
                                className="form-input"
                                onChange={handleChange}
                                value={formData.email}
                                placeholder="소문자로입력해주세요"
                            />
                            <button type="button" className="btn btn-secondary" onClick={checkEmail}>
                                중복확인
                            </button>
                        </div>
                    </div>
                    {errors.email && <ErrorMessage message={errors.email} />}
                    {!errors.email && emailCheckMsg && <ErrorMessage message={emailCheckMsg} success={isEmailValid} />}
                    <div className="form-group">
                        <label className="form-label required">생년월일</label>
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
                        <div className="form-row">
                            <input
                                type="text"
                                name="nickName"
                                className="form-input"
                                value={formData.nickName}
                                onChange={handleChange}
                                placeholder="닉네임은 2글자 이상이어야합니다"
                            />
                            <button type="button" className="btn btn-secondary" onClick={checkNickName}>
                                중복확인
                            </button>
                        </div>
                    </div>
                    {errors.nickName && <ErrorMessage message={errors.nickName} />}
                    {!errors.nickName && nickNameCheckMsg && (
                        <ErrorMessage message={nickNameCheckMsg} success={isNickNameValid} />
                    )}
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
