'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { CATEGORY_OPTIONS } from '@/app/auth/signup/seller/component/studioCategoryList'
import type { MainContentProps } from '../types/mainContent.types'
import { useStudioAddValidation } from '@/app/auth/hooks/addStudioValidation'
import ErrorMessage from '@/app/auth/common/errorMessage'

export type StudioAddTabProps = Pick<
    MainContentProps,
    | 'userData'
    | 'studioList'
    | 'tempData'
    | 'isAuthenticated'
    | 'editMode'
    | 'passwordInput'
    | 'onVerifyPassword'
    | 'onEdit'
    | 'onSave'
    | 'onCancel'
    | 'onTempChange'
    | 'onAddressSearch'
    | 'onStudioImageChange'
    | 'studioImages'
>

export default function StudioAddTab(props: StudioAddTabProps) {
    const {
        isAuthenticated = false,
        editMode = {},
        passwordInput = '',
        tempData = {},
        studioImages = {},
        studioList = [],
        onTempChange,
        onVerifyPassword,
        onEdit,
        onSave,
        onCancel,
        onAddressSearch,
        onStudioImageChange,
    } = props

    /** 🔥 validation hook */
    const { errors, validateField, validateAll } = useStudioAddValidation()
    const requiredTextFields = [
        'studioBusinessNumber',
        'categoryId',
        'studioName',
        'studioDescription',
        'studioMobile',
        'studioOfficeTell',
        'studioFax',
        'studioEmail',
        'studioAddPostNumber',
        'studioAddMain',
        'studioAddDetail',
    ] as const

    /** 🔥 필수 이미지 필드 */
    const hasMainImage = !!studioImages.STUDIO_MAIN
    const hasLogoImage = !!studioImages.STUDIO_LOGO
    const hasGalleryImages = Array.isArray(studioImages.STUDIO) && studioImages.STUDIO.length > 0

    /** 🔥 텍스트 필드 데이터 검증 */
    const textInputValid = requiredTextFields.every((f) => !!tempData[f])

    /** 🔥 error가 모두 비어 있는지 */
    const noErrors = Object.values(errors).every((msg) => !msg)

    /** 🔥 최종 폼 유효성 판단 */
    const isFormValid =
        editMode.studioAdd && textInputValid && hasMainImage && hasLogoImage && hasGalleryImages && noErrors
    /** 🔥 tempData 변경 + 실시간 validate 함께 수행 */
    const handleValidatedChange = (field: string, value: any) => {
        onTempChange(field, value)
        validateField(field as any, value, {
            ...tempData,
            [field]: value,
        })
    }

    /** 🔥 신규 등록 editMode가 켜질 때 모든 필드 재검증 */
    useEffect(() => {
        if (!editMode.studioAdd) return

        // 텍스트 전체 재검증
        Object.keys(tempData).forEach((key) => {
            validateField(key as any, tempData[key], tempData)
        })

        // 이미지 재검증
        validateField('studioMainImageUrl' as any, studioImages.STUDIO_MAIN ? 'uploaded' : null, tempData)
        validateField('studioLogoImageUrl' as any, studioImages.STUDIO_LOGO ? 'uploaded' : null, tempData)
        validateField('studioGalleryImageUrls' as any, studioImages.STUDIO ?? [], tempData)
    }, [tempData, studioImages, editMode.studioAdd])
    /** 🔥 저장 클릭 시 전체 validate */
    const handleSave = () => {
        const fullStudioInfo = {
            ...tempData,
            studioMainImageUrl: studioImages.STUDIO_MAIN ? 'uploaded' : null,
            studioLogoImageUrl: studioImages.STUDIO_LOGO ? 'uploaded' : null,
            studioGalleryImageUrls: studioImages.STUDIO ?? [],
        }

        const ok = validateAll(fullStudioInfo as any)

        if (!ok) {
            alert('입력값을 확인해주세요.')
            return
        }

        onSave('studioAdd')
    }

    return (
        <div className="tab-content">
            {/* 인증 여부 */}
            {!isAuthenticated ? (
                <div className="auth-banner">
                    <span>공방 등록을 위해 비밀번호 인증이 필요합니다</span>
                    <div className="auth-banner-input">
                        <input
                            type="password"
                            placeholder="현재 비밀번호 입력"
                            value={passwordInput}
                            onChange={(e) => handleValidatedChange('passwordInput', e.target.value)}
                        />
                        <button onClick={onVerifyPassword}>인증 확인</button>
                    </div>
                </div>
            ) : (
                <div className="auth-banner success">인증 완료</div>
            )}

            <div className="section-header">
                <h2>신규공방등록</h2>

                {!editMode.studioAdd ? (
                    <button className="btn-primary" onClick={() => onEdit('studioAdd')}>
                        신규 등록
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={handleSave} disabled={!isFormValid}>
                            저장
                        </button>
                        <button className="btn-secondary" onClick={() => onCancel('studioAdd')}>
                            취소
                        </button>
                    </div>
                )}
            </div>

            {/* 신규 등록 모드 아닐 때 → 공방 리스트 */}
            {!editMode.studioAdd && (
                <div className="studio-list">
                    {studioList.length === 0 ? (
                        <p>등록된 공방이 없습니다.</p>
                    ) : (
                        studioList.map((studio) => (
                            <div key={studio.studioId} className="studio-item">
                                <Link href={`/seller/studio/${studio.studioId}`}>
                                    <img
                                        src={`http://localhost:8090/images/${studio.studioLogoImage.imageFileName}`}
                                        alt="logo"
                                        width={80}
                                        height={80}
                                        style={{ borderRadius: 8 }}
                                    />
                                </Link>
                                <div className="info">
                                    <h3>{studio.studioName}</h3>
                                    <p>{studio.studioDescription}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* 신규 등록 Form */}
            {editMode.studioAdd && (
                <div className="studio-add-form">
                    {/* 사업자번호 */}
                    <div className="form-group">
                        <label>사업자번호</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioBusinessNumber || ''}
                            onChange={(e) => handleValidatedChange('studioBusinessNumber', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.studioBusinessNumber} />

                    {/* 카테고리 */}
                    <div className="form-group">
                        <label>카테고리</label>
                        <select
                            className="editable"
                            value={tempData.categoryId || ''}
                            onChange={(e) => handleValidatedChange('categoryId', e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            {CATEGORY_OPTIONS.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <ErrorMessage message={errors.categoryId} />

                    {/* 공방이름 */}
                    <div className="form-group">
                        <label>공방 이름</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioName || ''}
                            onChange={(e) => handleValidatedChange('studioName', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.studioName} />

                    {/* 설명 */}
                    <div className="form-group">
                        <label>상세설명</label>
                        <textarea
                            className="editable"
                            rows={5}
                            value={tempData.studioDescription || ''}
                            onChange={(e) => handleValidatedChange('studioDescription', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.studioDescription} />

                    {/* 대표번호 */}
                    <div className="form-group">
                        <label>대표번호</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioMobile || ''}
                            onChange={(e) => handleValidatedChange('studioMobile', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.studioMobile} />

                    {/* 공방사무실 전화번호 (OfficeTell) */}
                    <div className="form-group">
                        <label>공방사무실전화번호</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioOfficeTell || ''}
                            onChange={(e) => handleValidatedChange('studioOfficeTell', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.studioOfficeTell} />

                    {/* 팩스번호 */}
                    <div className="form-group">
                        <label>팩스</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioFax || ''}
                            onChange={(e) => handleValidatedChange('studioFax', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.studioFax} />

                    {/* 이메일 */}
                    <div className="form-group">
                        <label>이메일</label>
                        <input
                            type="email"
                            className="editable"
                            value={tempData.studioEmail || ''}
                            onChange={(e) => handleValidatedChange('studioEmail', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.studioEmail} />

                    {/* 주소 */}
                    <div className="form-group">
                        <label>주소</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                className="editable"
                                placeholder="우편번호"
                                value={tempData.studioAddPostNumber || ''}
                                onChange={(e) => handleValidatedChange('studioAddPostNumber', e.target.value)}
                                style={{ width: '140px' }}
                            />
                            <button type="button" className="btn-secondary" onClick={onAddressSearch}>
                                주소 검색
                            </button>
                        </div>
                        <ErrorMessage message={errors.studioAddPostNumber} />

                        <input
                            type="text"
                            className="editable"
                            placeholder="기본주소"
                            style={{ marginTop: 8 }}
                            value={tempData.studioAddMain || ''}
                            onChange={(e) => handleValidatedChange('studioAddMain', e.target.value)}
                        />
                        <ErrorMessage message={errors.studioAddMain} />

                        <input
                            type="text"
                            className="editable"
                            placeholder="상세주소"
                            style={{ marginTop: 8 }}
                            value={tempData.studioAddDetail || ''}
                            onChange={(e) => handleValidatedChange('studioAddDetail', e.target.value)}
                        />
                        <ErrorMessage message={errors.studioAddDetail} />
                    </div>

                    {/* 대표 이미지 */}
                    <div className="form-group">
                        <label>대표 이미지</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onStudioImageChange?.('STUDIO_MAIN', e.target.files?.[0] ?? null)}
                        />
                        {studioImages.STUDIO_MAIN && (
                            <img
                                src={URL.createObjectURL(studioImages.STUDIO_MAIN)}
                                style={{ width: 150, marginTop: 10, borderRadius: 8 }}
                            />
                        )}
                        <ErrorMessage message={errors.studioMainImageUrl} />
                    </div>

                    {/* 로고 이미지 */}
                    <div className="form-group">
                        <label>로고 이미지</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onStudioImageChange?.('STUDIO_LOGO', e.target.files?.[0] ?? null)}
                        />
                        {studioImages.STUDIO_LOGO && (
                            <img
                                src={URL.createObjectURL(studioImages.STUDIO_LOGO)}
                                style={{ width: 150, marginTop: 10, borderRadius: 8 }}
                            />
                        )}
                        <ErrorMessage message={errors.studioLogoImageUrl} />
                    </div>

                    {/* 갤러리 */}
                    <div className="form-group">
                        <label>갤러리 이미지</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                                onStudioImageChange?.('STUDIO', e.target.files ? Array.from(e.target.files) : [])
                            }
                        />

                        {studioImages.STUDIO?.length > 0 && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                {studioImages.STUDIO.map((file, idx) => (
                                    <img
                                        key={idx}
                                        src={URL.createObjectURL(file)}
                                        style={{ width: 120, borderRadius: 8 }}
                                    />
                                ))}
                            </div>
                        )}
                        <ErrorMessage message={errors.studioGalleryImageUrls} />
                    </div>
                </div>
            )}
        </div>
    )
}
