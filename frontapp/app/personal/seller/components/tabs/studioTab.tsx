import type { MainContentProps } from '../types/mainContent.types'
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
    } = props
    console.log('📌 StudioTab props:', props)

    const serverImageUrl = (fileName: string) => `http://localhost:8090/api/v1/images/${fileName}`

    // 새 업로드 이미지 preview 생성
    const createPreview = (file: File | null) => (file ? URL.createObjectURL(file) : null)

    const previewMainImage =
        createPreview(studioImages?.STUDIO_MAIN ?? null) ||
        (studio?.studioMainImage?.imageUrl ? serverImageUrl(studio.studioMainImage.imageUrl) : null)

    const previewLogoImage =
        createPreview(studioImages?.STUDIO_LOGO ?? null) ||
        (studio?.studioLogoImage?.imageUrl ? serverImageUrl(studio.studioLogoImage.imageUrl) : null)

    // 갤러리 이미지(새 파일 + 기존 이미지 합쳐서 미리보기)
    const previewGalleryImages: string[] = [
        ...(studioImages?.STUDIO ?? []).map((f) => URL.createObjectURL(f)),
        ...(studio?.studioImages ?? []).map((img: any) => serverImageUrl(img.imageUrl)),
    ]

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
                <div className="auth-banner success">인증 완료</div>
            )}

            <div className="section-header">
                <h2>공방정보수정</h2>
                {!editMode.studio ? (
                    <button className="btn-primary" onClick={() => onEdit('studio')}>
                        수정
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={() => onSave('studio')}>
                            저장
                        </button>
                        <button className="btn-secondary" onClick={() => onCancel('studio')}>
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
                            onChange={(e) => onTempChange('studioName', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioName}</p>
                    )}
                </div>
                <div className="form-group">
                    <label>공방대표번호</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioMobile || ''}
                            onChange={(e) => onTempChange('studioMobile', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioMobile}</p>
                    )}
                </div>
                <div className="form-group">
                    <label>사무실전화번호</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioOfficeTell || ''}
                            onChange={(e) => onTempChange('studioOfficeTell', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioOfficeTell}</p>
                    )}
                </div>
                <div className="form-group">
                    <label>팩스</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioFax || ''}
                            onChange={(e) => onTempChange('studioFax', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioFax}</p>
                    )}
                </div>
                <div className="form-group">
                    <label>이메일</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioEmail || ''}
                            onChange={(e) => onTempChange('studioEmail', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioEmail}</p>
                    )}
                </div>
                <div className="form-group">
                    <label>우편번호</label>
                    {editMode.studio ? (
                        <>
                            <input
                                type="text"
                                value={tempData.studioAddPostNumber || ''}
                                onChange={(e) => onTempChange('studioAddPostNumber', e.target.value)}
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
                <div className="form-group">
                    <label>기본주소</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioAddMain || ''}
                            onChange={(e) => onTempChange('studioAddMain', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioAddMain}</p>
                    )}
                </div>
                <div className="form-group">
                    <label>상세주소</label>
                    {editMode.studio ? (
                        <input
                            type="text"
                            value={tempData.studioAddDetail || ''}
                            onChange={(e) => onTempChange('studioAddDetail', e.target.value)}
                            className="editable"
                        />
                    ) : (
                        <p>{studio.studioAddDetail}</p>
                    )}
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
                            style={{ maxWidth: '250px', marginTop: '10px' }}
                        />
                    )}
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

                    {/* 기존 서버 이미지 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                        {(studio?.studioImages ?? []).map((img) => (
                            <img
                                key={img.id}
                                src={`http://localhost:8090/images/${img.imageFileName}`}
                                style={{ width: 150, height: 150, objectFit: 'cover' }}
                            />
                        ))}
                    </div>

                    {/* 새로 업로드한 미리보기 이미지 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                        {previewGalleryImages.map((src, idx) => (
                            <img key={idx} src={src} style={{ width: 150, height: 150, objectFit: 'cover' }} />
                        ))}
                    </div>
                </div>
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
        */
