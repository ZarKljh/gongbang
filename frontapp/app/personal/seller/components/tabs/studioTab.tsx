import { useEffect } from 'react'
import type { MainContentProps } from '../types/mainContent.types'
import { signupSellerValidation } from '@/app/auth/hooks/signupSellerValidation'
import ErrorMessage from '@/app/auth/common/errorMessage'
import { useStudioTabValidation } from '@/app/auth/hooks/updateStudioValidation'
import ReactMarkdown from 'react-markdown'

/*
interface StudioTabProps {
    userData: any
    tempData: any
    isAuthenticated: boolean
    editMode: any
    passwordInput: string
    newPassword: string
    confirmPassword: string
    onVerifyPassword: () => void
    onEdit: (section: string) => void
    onSave: (section: string) => void
    onCancel: (section: string) => void
    onTempChange: (field: string, value: string) => void
    onNewPasswordChange: (val: string) => void
    onConfirmPasswordChange: (val: string) => void
    studioList: any[]
    studio: any
}
*/
export type StudioTabProps = Pick<
    MainContentProps,
    | 'userData'
    | 'tempData'
    | 'isAuthenticated'
    | 'editMode'
    | 'passwordInput'
    | 'newPassword'
    | 'confirmPassword'
    | 'onVerifyPassword'
    | 'onEdit'
    | 'onSave'
    | 'onCancel'
    | 'onTempChange'
    | 'onNewPasswordChange'
    | 'onConfirmPasswordChange'
    | 'activeSubTab'
    | 'onSubTabClick'
    | 'stats'
    | 'studioList'
    | 'studio'
    | 'onAddressSearch'
    | 'studioImages'
    | 'onStudioImageChange'
    | 'deletedGalleryImageIds'
    | 'setDeletedGalleryImageIds'
>

/*
export interface StudioTabProps {
    activeSubTab: string
    onSubTabClick: (tab: string) => void
    userData: any
    stats: any
    studioList: any[]
    studio: any
}
*/
export default function StudioTab(props: StudioTabProps) {
    const {
        isAuthenticated = false,
        editMode = {},
        passwordInput = '',
        newPassword = '',
        confirmPassword = '',
        tempData = {},
        studio = {},
        onTempChange,
        onVerifyPassword,
        onEdit,
        onSave,
        onCancel,
        onNewPasswordChange,
        onConfirmPasswordChange,
        onAddressSearch,
        studioImages,
        onStudioImageChange,
        deletedGalleryImageIds,
        setDeletedGalleryImageIds,
    } = props

    console.log('📌 StudioTab props:', props)

    const studioTabFields: (keyof StudioInfo)[] = [
        'studioName',
        'studioMobile',
        'studioOfficeTell',
        'studioFax',
        'studioEmail',
        'studioAddPostNumber',
        'studioAddMain',
        'studioAddDetail',
    ]

    const { errors, validateField, validateAll } = useStudioTabValidation()
    const imageValid =
        (studioImages.STUDIO_MAIN || studio?.studioMainImage) &&
        (studioImages.STUDIO_LOGO || studio?.studioLogoImage) &&
        (studioImages.STUDIO?.length ?? 0) + (studio.studioImages?.length ?? 0) - deletedGalleryImageIds.length > 0

    const textValid = studioTabFields.every((f) => !!tempData[f])

    const noErrors = Object.values(errors).every((e) => !e)

    const isFormValid = editMode.studio && textValid && imageValid && noErrors
    const serverImageUrl = (fileName: string) => `http://localhost:8090/images/${fileName}`

    /** 🔥 부모 onTempChange + validation 함께 실행하는 wrapper */
    const handleValidatedChange = (field: keyof StudioInfo, value: any) => {
        onTempChange(field, value)
        validateField(field, value, {
            ...tempData,
            [field]: value,
        })
    }

    /** 🔥 editMode가 true가 될 때 전체 re-validate */
    useEffect(() => {
        if (!editMode.studio) return

        // 텍스트 필드 전체 검증
        Object.keys(tempData).forEach((key) => {
            validateField(key as keyof StudioInfo, tempData[key], tempData)
        })

        // 이미지 검증 추가
        validateField(
            'studioMainImageUrl',
            studioImages.STUDIO_MAIN ? 'uploaded' : studio?.studioMainImage ? 'server' : null,
            tempData,
        )

        validateField(
            'studioLogoImageUrl',
            studioImages.STUDIO_LOGO ? 'uploaded' : studio?.studioLogoImage ? 'server' : null,
            tempData,
        )

        validateField(
            'studioGalleryImageUrls',
            [
                ...(studioImages.STUDIO ?? []),
                ...(studio.studioImages ?? []).filter((img) => !deletedGalleryImageIds.includes(img.id)),
            ],
            tempData,
        )
    }, [tempData, studioImages, deletedGalleryImageIds, editMode.studio])

    /** 🔥 저장 클릭 시 전체 확인 */
    const handleSave = () => {
        const hasMain = !!studioImages.STUDIO_MAIN
        const hasLogo = !!studioImages.STUDIO_LOGO
        const hasGallery = studioImages.STUDIO.length > 0

        const fullStudioInfo = {
            ...tempData,
            studioMainImageUrl: studioImages.STUDIO_MAIN ? 'uploaded' : studio?.studioMainImage ? 'server' : null,

            studioLogoImageUrl: studioImages.STUDIO_LOGO ? 'uploaded' : studio?.studioLogoImage ? 'server' : null,

            studioGalleryImageUrls: [
                ...(studioImages.STUDIO ?? []),
                ...(studio?.studioImages ?? []).filter((img) => !deletedGalleryImageIds.includes(img.id)),
            ],
        }

        const ok = validateAll(fullStudioInfo as any)

        if (!ok) {
            alert('입력값을 확인해주세요.')
            return
        }

        onSave('studio')
    }

    // 새 업로드 이미지 preview 생성
    const createPreview = (file: File | null) => (file ? URL.createObjectURL(file) : null)

    const previewMainImage =
        createPreview(studioImages?.STUDIO_MAIN ?? null) ||
        (studio?.studioMainImage?.imageUrl ? serverImageUrl(studio.studioMainImage.imageUrl) : null)

    const previewLogoImage =
        createPreview(studioImages?.STUDIO_LOGO ?? null) ||
        (studio?.studioLogoImage?.imageUrl ? serverImageUrl(studio.studioLogoImage.imageUrl) : null)

    // 갤러리 이미지(새 파일 + 기존 이미지 합쳐서 미리보기)
    /*
    const previewGalleryImages: string[] = [
        ...(studioImages?.STUDIO ?? []).map((f) => URL.createObjectURL(f)),
        ...(studio?.studioImages ?? []).map((img: any) => serverImageUrl(img.imageUrl)),
    ]
    */

    const previewGalleryImages: {
        src: string
        isNew: boolean
        imageId?: number
        newIndex?: number
    }[] = [
        // 🔹 새로 업로드된 이미지들
        ...(studioImages?.STUDIO ?? []).map((file, index) => ({
            src: URL.createObjectURL(file),
            isNew: true,
            newIndex: index,
        })),

        // 🔹 기존 이미지들 (삭제되지 않은 것만)
        ...(studio?.studioImages ?? [])
            .filter((img) => !props.deletedGalleryImageIds?.includes(img.id))
            .map((img) => ({
                src: serverImageUrl(img.imageFileName),
                isNew: false,
                imageId: img.id,
            })),
    ]
    console.log('🖼 previewGalleryImages:', previewGalleryImages)
    console.log('🗑 현재 삭제 리스트:', deletedGalleryImageIds)
    return (
        <div className="tab-content">
            {!isAuthenticated ? (
                <div className="auth-banner">
                    <span>정보 수정을 위해 비밀번호 인증이 필요합니다</span>
                    <div className="auth-banner-input">
                        <input
                            type="password"
                            placeholder="현재 비밀번호 입력"
                            value={passwordInput}
                            onChange={(e) => onTempChange('passwordInput', e.target.value)}
                        />
                        <button onClick={onVerifyPassword}>인증 확인</button>
                    </div>
                </div>
            ) : (
                <div className="auth-banner success">비밀번호 인증 완료</div>
            )}

            <div className="section-header">
                <h2>공방정보수정</h2>
                {!editMode.studio ? (
                    <button className="btn-primary" onClick={() => onEdit('studio')}>
                        수정
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={handleSave} disabled={!isFormValid}>
                            저장
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                onCancel('studio')
                            }}
                        >
                            취소
                        </button>
                    </div>
                )}
            </div>
            <div>
                <div className="form-group">
                    <label>사업자번호</label>
                    <p>{studio.studioBusinessNumber}</p>
                </div>
                <div className="form-group">
                    <label>공방이름</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioName || ''}
                            onChange={(e) => handleValidatedChange('studioName', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioName}</p>
                    )}
                </div>
                {editMode.studio && <ErrorMessage message={errors.studioName} />}
                <div className="form-group">
                    <label>공방대표번호</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioMobile || ''}
                            onChange={(e) => handleValidatedChange('studioMobile', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioMobile}</p>
                    )}
                </div>
                {editMode.studio && <ErrorMessage message={errors.studioMobile} />}
                <div className="form-group">
                    <label>사무실전화번호</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioOfficeTell || ''}
                            onChange={(e) => handleValidatedChange('studioOfficeTell', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioOfficeTell}</p>
                    )}
                </div>
                {editMode.studio && <ErrorMessage message={errors.studioOfficeTell} />}
                <div className="form-group">
                    <label>팩스</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioFax || ''}
                            onChange={(e) => handleValidatedChange('studioFax', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioFax}</p>
                    )}
                </div>
                {editMode.studio && <ErrorMessage message={errors.studioFax} />}
                <div className="form-group">
                    <label>이메일</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioEmail || ''}
                            onChange={(e) => handleValidatedChange('studioEmail', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioEmail}</p>
                    )}
                </div>
                {editMode.studio && <ErrorMessage message={errors.studioEmail} />}
                <div className="form-group">
                    <label>우편번호</label>
                    {editMode.studio ? (
                        <>
                            <input
                                type="text"
                                value={tempData.studioAddPostNumber || ''}
                                onChange={(e) => handleValidatedChange('studioAddPostNumber', e.target.value)}
                                className="editable"
                            />
                            <button className="btn btn-primary address-btn" type="button" onClick={onAddressSearch}>
                                주소 찾기
                            </button>
                        </>
                    ) : (
                        <p>{studio.studioAddPostNumber}</p>
                    )}
                </div>
                {editMode.studio && <ErrorMessage message={errors.studioAddPostNumber} />}
                <div className="form-group">
                    <label>기본주소</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioAddMain || ''}
                            onChange={(e) => handleValidatedChange('studioAddMain', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioAddMain}</p>
                    )}
                </div>
                {editMode.studio && <ErrorMessage message={errors.studioAddMain} />}
                <div className="form-group">
                    <label>상세주소</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioAddDetail || ''}
                            onChange={(e) => handleValidatedChange('studioAddDetail', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioAddDetail}</p>
                    )}
                </div>
                {/* 상세설명 출력 or 편집 */}
                <div className="form-group">
                    <label>공방 상세설명</label>
                    {!editMode.studio ? (
                        <div className="markdown-view">
                            <ReactMarkdown>{studio.studioDescription || '등록된 상세설명이 없습니다.'}</ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            className="markdown-editor editable"
                            value={tempData.studioDescription || ''}
                            onChange={(e) => handleValidatedChange('studioDescription', e.target.value)}
                            placeholder="Markdown 문법으로 공방 상세설명을 작성하세요."
                            rows={1}
                        />
                    )}
                </div>
                {editMode.studio && <ErrorMessage message={errors.studioAddDetail} />}

                {/* 새로운 메인이미지 등록폼 start */}
                <div className="form-group">
                    <label>메인이미지</label>

                    <div className="image-field">
                        {/* 파일명 + 파일선택 버튼 */}
                        <div className="image-file-row">
                            <div className="file-name-box">
                                {studioImages?.STUDIO_MAIN
                                    ? studioImages.STUDIO_MAIN.name
                                    : studio?.studioMainImage?.imageFileName || ''}
                            </div>

                            {editMode.studio && (
                                <button
                                    className="upload-btn"
                                    onClick={() => document.getElementById('mainImageInput')?.click()}
                                >
                                    파일선택
                                </button>
                            )}

                            <input
                                id="mainImageInput"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        onStudioImageChange?.('STUDIO_MAIN', e.target.files[0])
                                    }
                                }}
                            />
                        </div>

                        {/* 미리보기 박스 — form-group 안쪽에 넣어야 layout이 깨지지 않음 */}
                        <div className="image-preview-wide">
                            {previewMainImage && <img src={previewMainImage} alt="메인 이미지" />}
                        </div>
                    </div>
                </div>
                {/* 새로운 메인이미지 등록폼 end */}

                {/* 새로운 로고이미지 등록폼 start */}
                <div className="form-group">
                    <label>로고이미지</label>

                    <div className="image-field">
                        {/* 파일명 + 파일선택 버튼 */}
                        <div className="image-file-row">
                            <div className="file-name-box">
                                {studioImages?.STUDIO_LOGO
                                    ? studioImages.STUDIO_LOGO.name
                                    : studio?.studioLogoImage?.imageFileName || ''}
                            </div>

                            {editMode.studio && (
                                <button
                                    className="upload-btn"
                                    onClick={() => document.getElementById('logoImageInput')?.click()}
                                >
                                    파일선택
                                </button>
                            )}

                            <input
                                id="logoImageInput"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        onStudioImageChange?.('STUDIO_LOGO', e.target.files[0])
                                    }
                                }}
                            />
                        </div>

                        {/* 미리보기 박스 */}
                        <div className="image-preview-wide">
                            {previewLogoImage && <img src={previewLogoImage} alt="공방 로고 이미지" />}
                        </div>
                    </div>
                </div>

                {/* 새로운 로고이미지 등록폼 end */}
                {/* 새로운 공방이미지 등록폼 start */}
                <div className="form-group">
                    <label>공방이미지</label>

                    <div className="image-field">
                        {/* 파일명 + 버튼 영역 */}
                        <div className="image-file-row">
                            <div className="file-name-box">
                                {studioImages?.STUDIO && studioImages.STUDIO.length > 0
                                    ? `${studioImages.STUDIO.length}개의 파일`
                                    : previewGalleryImages.length > 0
                                    ? `${previewGalleryImages.length}개의 이미지`
                                    : ''}
                            </div>

                            {editMode.studio && (
                                <button
                                    className="upload-btn"
                                    onClick={() => document.getElementById('galleryImageInput')?.click()}
                                >
                                    파일선택
                                </button>
                            )}

                            {/* 실제 업로드 input (숨김) */}
                            <input
                                id="galleryImageInput"
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files) {
                                        onStudioImageChange?.('STUDIO', Array.from(e.target.files))
                                    }
                                }}
                            />
                        </div>

                        {/* 미리보기 박스 */}
                        <div className="image-preview-wide" style={{ minHeight: 'auto', padding: '16px' }}>
                            <div className="gallery-wrapper">
                                {previewGalleryImages.map((item, idx) => (
                                    <div key={idx} className="gallery-item">
                                        <img src={item.src} />

                                        {/* X 버튼 — 편집모드에서만 표시 */}
                                        {editMode.studio && (
                                            <button
                                                className="gallery-delete-btn"
                                                onClick={() => {
                                                    if (item.isNew) {
                                                        // 새로 업로드한 이미지 삭제
                                                        const newList =
                                                            studioImages?.STUDIO?.filter(
                                                                (_, i) => i !== item.newIndex,
                                                            ) ?? []
                                                        onStudioImageChange?.('STUDIO', newList)
                                                    } else {
                                                        // 기존 이미지 삭제 목록에 추가
                                                        props.setDeletedGalleryImageIds?.((prev) => [
                                                            ...prev,
                                                            item.imageId!,
                                                        ])
                                                    }
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* 새로운 공방이미지 등록폼 end */}

                <p>{/*JSON.stringify(studio)*/}</p>
            </div>
        </div>
    )
}

/*

            <div className="form-group">
                <label className="form-label">우편번호</label>
                <div className="form-row">
                    <input
                        type="text"
                        name="studioAddPostNumber"
                        className="form-input"
                        value={studioInfo.studioAddPostNumber}
                        onChange={onChange}
                        placeholder="우편번호를 검색해주세요"
                    />
                    <button className="btn btn-primary address-btn" type="button" onClick={handleAddressSearch}>
                        주소 찾기
                    </button>
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">기본주소</label>
                <input
                    type="text"
                    name="studioAddMain"
                    className="form-input"
                    value={studioInfo.studioAddMain}
                    onChange={onChange}
                    placeholder="공방소재지의 기본주소를 입력해주세요"
                />
            </div>
            <div className="form-group">
                <label className="form-label">상세주소</label>
                <input
                    type="text"
                    name="studioAddDetail"
                    className="form-input"
                    value={studioInfo.studioAddDetail}
                    onChange={onChange}
                    placeholder="공방소재재의 상세주소를 적어주세요"
                />
            </div>
            <div className="form-group">
                <label className="form-label">대표 이미지</label>
                <input type="file" name="studioMainImage" className="form-input" accept="image/*" onChange={onChange} />
                {previewMainImage && (
                    <div className="image-preview">
                        <p>대표 이미지 미리보기:</p>
                        <img
                            src={previewMainImage}
                            alt="대표 이미지"
                            style={{ maxWidth: '300px', marginTop: '10px' }}
                        />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">로고 이미지</label>
                <input type="file" name="studioLogoImage" className="form-input" accept="image/*" onChange={onChange} />
                {previewLogoImage && (
                    <div className="image-preview">
                        <p>로고 이미지 미리보기:</p>
                        <img
                            src={previewLogoImage}
                            alt="로고 이미지"
                            style={{ maxWidth: '300px', marginTop: '10px' }}
                        />
                    </div>
                )}
            </div>

            <div>
                <div className="form-group">
                    <label>이름</label>
                    <p>{userData.fullName}</p>
                </div>

                <div className="form-group">
                    <label>닉네임</label>
                    {editMode.profile ? (
                        <input
                            type="text"
                            value={tempData.nickName || ''}
                            onChange={(e) => onTempChange('nickName', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{userData.nickName}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>비밀번호</label>
                    {editMode.profile ? (
                        <input
                            type="password"
                            placeholder="새 비밀번호 입력"
                            value={newPassword}
                            onChange={(e) => onNewPasswordChange(e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>********</p>
                    )}
                </div>

                {editMode.profile && (
                    <div className="form-group">
                        <label>비밀번호 확인</label>
                        <input
                            type="password"
                            placeholder="비밀번호 재입력"
                            value={confirmPassword}
                            onChange={(e) => onConfirmPasswordChange(e.target.value)}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>이메일</label>
                    {editMode.profile ? (
                        <input
                            type="email"
                            value={tempData.email || ''}
                            onChange={(e) => onTempChange('email', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{userData.email}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>휴대폰</label>
                    {editMode.profile ? (
                        <input
                            type="tel"
                            value={tempData.mobilePhone || ''}
                            onChange={(e) => onTempChange('mobilePhone', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{userData.mobilePhone}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>생년월일</label>
                    <p>{userData.birth}</p>
                </div>
                <div className="form-group">
                    <label>성별</label>
                    <p>{userData.gender === 'MALE' ? '남성' : '여성'}</p>
                </div>
            </div>
        </div>

                 <div className="form-group">
                    <label>메인화면</label>
                    {editMode.studio && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    onStudioImageChange?.('STUDIO_MAIN', e.target.files[0])
                                }
                            }}
                        />
                    )}
                    <div className="image-preview-wrapper">
                        {previewMainImage && (
                            <img
                                src={
                                    studioImages?.STUDIO_MAIN
                                        ? URL.createObjectURL(studioImages.STUDIO_MAIN)
                                        : studio?.studioMainImage?.imageFileName
                                        ? `http://localhost:8090/images/${studio.studioMainImage.imageUrl}`
                                        : '/default-main.png'
                                }
                                alt="대표 이미지"
                            />
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>로고이미지</label>
                    {editMode.studio && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    onStudioImageChange?.('STUDIO_LOGO', e.target.files[0])
                                }
                            }}
                        />
                    )}
                    <div className="image-preview-wrapper">
                        {previewLogoImage && (
                            <img
                                src={
                                    studioImages?.STUDIO_LOGO
                                        ? URL.createObjectURL(studioImages.STUDIO_LOGO)
                                        : studio?.studioLogoImage?.imageFileName
                                        ? `http://localhost:8090/images/${studio.studioLogoImage.imageUrl}`
                                        : '/default-logo.png'
                                }
                                alt="공방 로고 이미지"
                            />
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>공방이미지</label>

                    {editMode.studio && (
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                if (e.target.files) {
                                    onStudioImageChange?.('STUDIO', Array.from(e.target.files))
                                }
                            }}
                        />
                    )}

                    
                    <div className="gallery-wrapper">
                        {previewGalleryImages.map((item, idx) => (
                            <div key={idx} className="gallery-item">
                                <img src={item.src} />

                               
                                {editMode.studio && (
                                    <button
                                        className="gallery-delete-btn"
                                        onClick={() => {
                                            if (item.isNew) {
                                                // 🔥 새로 업로드한 이미지 삭제
                                                const newList =
                                                    studioImages?.STUDIO?.filter((_, i) => i !== item.newIndex) ?? []
                                                onStudioImageChange?.('STUDIO', newList)
                                            } else {
                                                // 🔥 기존 이미지 삭제 목록에 추가 (id 기반)
                                                props.setDeletedGalleryImageIds?.((prev) => [...prev, item.imageId!])
                                            }
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
        */
