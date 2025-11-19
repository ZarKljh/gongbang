import React from 'react'
import { StudioInfo } from '../types'
import { CATEGORY_OPTIONS } from '../component/studioCategoryList'
import ErrorMessage from '@/app/auth/common/errorMessage'
import './signup_seller_component.css'

interface Props {
    studioInfo: StudioInfo
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    onMainImagePreview: (e: React.ChangeEvent<HTMLInputElement>) => void
    onLogoImagePreview: (e: React.ChangeEvent<HTMLInputElement>) => void
    onGalleryImagesPreview: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSubmit: () => void
    onPrev: () => void
    setStudioInfo: React.Dispatch<React.SetStateAction<StudioInfo>>
    previewMainImage: string | null
    previewLogoImage: string | null
    previewGalleryImages: string[]
    errors: any
}

declare global {
    interface Window {
        daum: any
    }
}

export default function StudioForm({
    studioInfo,
    onChange,
    onSubmit,
    onPrev,
    setStudioInfo,
    onMainImagePreview,
    onLogoImagePreview,
    onGalleryImagesPreview,
    previewMainImage,
    previewLogoImage,
    previewGalleryImages,
    errors,
}: Props) {
    const handleAddressSearch = () => {
        if (typeof window === 'undefined' || !window.daum) {
            alert('주소 검색 기능을 사용할 수 없습니다. 페이지를 새로고침 해주세요.')
            return
        }
        new window.daum.Postcode({
            oncomplete: function (data: any) {
                // ✅ [수정 2] onChange 대신 setStudioInfo 직접 호출
                setStudioInfo((prev) => ({
                    ...prev,
                    studioAddPostNumber: data.zonecode,
                    studioAddMain: data.roadAddress,
                }))
                /*
        new window.daum.Postcode({
            oncomplete: function (data: any) {
                // ✅ 수정된 부분: simulateChangeEvent 제거하고 직접 이벤트 객체 생성
                const postEvent = {
                    target: {
                        name: 'studioAddPostNumber',
                        value: data.zonecode,
                        type: 'text',
                    },
                } as React.ChangeEvent<HTMLInputElement>

                const addressEvent = {
                    target: {
                        name: 'studioAddMain',
                        value: data.roadAddress,
                        type: 'text',
                    },
                } as React.ChangeEvent<HTMLInputElement>

                onChange(postEvent)
                onChange(addressEvent)
                */
            },
        }).open()
    }

    return (
        <div className="form-container">
            <h4 className="form-title">매장 정보 입력</h4>
            <div className="form-group">
                <label className="form-label required">공방카테고리</label>
                <select name="categoryId" value={studioInfo.categoryId} onChange={onChange}>
                    <option value="" disabled>
                        공방 카테고리를 선택해주세요
                    </option>
                    {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <ErrorMessage message={errors.categoryId} />
            <div className="form-group">
                <label className="form-label required">사업자 번호</label>
                <input
                    type="text"
                    name="studioBusinessNumber"
                    className="form-input"
                    value={studioInfo.studioBusinessNumber}
                    onChange={onChange}
                    placeholder="사업자번호를 적어주세요"
                />
            </div>
            <ErrorMessage message={errors.studioBusinessNumber} />
            <div className="form-group">
                <label className="form-label required">공방이름</label>
                <input
                    type="text"
                    name="studioName"
                    className="form-input"
                    value={studioInfo.studioName}
                    onChange={onChange}
                    placeholder="공방의 이름을 적어주세요"
                />
            </div>
            <ErrorMessage message={errors.studioName} />
            <div className="form-group">
                <label className="form-label required">설명</label>
                <input
                    type="text"
                    name="studioDescription"
                    className="form-input"
                    value={studioInfo.studioDescription}
                    onChange={onChange}
                    placeholder="공방을 소개해주세요"
                />
            </div>
            <ErrorMessage message={errors.studioDescription} />
            <div className="form-group">
                <label className="form-label">전화번호</label>
                <input
                    type="text"
                    name="studioMobile"
                    className="form-input"
                    value={studioInfo.studioMobile}
                    onChange={onChange}
                    placeholder="공방대표전화번호를 적어주세요"
                />
            </div>
            <ErrorMessage message={errors.studioMobile} />
            <div className="form-group">
                <label className="form-label">사무실 전화</label>
                <input
                    type="text"
                    name="studioOfficeTell"
                    className="form-input"
                    value={studioInfo.studioOfficeTell}
                    onChange={onChange}
                    placeholder="공방사무실 전화번호를 적어주세요"
                />
            </div>
            <ErrorMessage message={errors.studioOfficeTell} />
            <div className="form-group">
                <label className="form-label">팩스</label>
                <input
                    type="text"
                    name="studioFax"
                    className="form-input"
                    value={studioInfo.studioFax}
                    onChange={onChange}
                    placeholder="공방FAX번호를 적어주세요"
                />
            </div>
            <ErrorMessage message={errors.studioFax} />
            <div className="form-group">
                <label className="form-label">이메일</label>
                <input
                    type="email"
                    name="studioEmail"
                    className="form-input"
                    value={studioInfo.studioEmail}
                    onChange={onChange}
                    placeholder="공방의 대표 이메일을 적어주세요"
                />
            </div>
            <ErrorMessage message={errors.studioEmail} />
            <div className="form-group">
                <label className="form-label required">우편번호</label>
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
            <ErrorMessage message={errors.studioAddPostNumber} />
            <div className="form-group">
                <label className="form-label required">기본주소</label>
                <input
                    type="text"
                    name="studioAddMain"
                    className="form-input"
                    value={studioInfo.studioAddMain}
                    onChange={onChange}
                    placeholder="공방소재지의 기본주소를 입력해주세요"
                />
            </div>
            <ErrorMessage message={errors.studioAddMain} />
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
            <ErrorMessage message={errors.studioAddDetail} />
            <div className="form-group">
                <label className="form-label">대표 이미지</label>
                <input
                    type="file"
                    name="studioMainImage"
                    className="form-input"
                    accept="image/*"
                    onChange={onMainImagePreview}
                />
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
                <input
                    type="file"
                    name="studioLogoImage"
                    className="form-input"
                    accept="image/*"
                    onChange={onLogoImagePreview}
                />
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

            <div className="form-group">
                <label className="form-label">매장 사진 (최대 5장)</label>
                <input
                    type="file"
                    name="studioGalleryImages"
                    className="form-input"
                    accept="image/*"
                    multiple
                    onChange={onGalleryImagesPreview}
                />
                {previewGalleryImages.length > 0 && (
                    <div className="image-preview">
                        <p>매장 사진 미리보기:</p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                            {previewGalleryImages.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`매장사진${index + 1}`}
                                    style={{ width: '150px', borderRadius: '6px' }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="button-group">
                <button className="btn btn-primary" type="button" onClick={onPrev}>
                    이전 단계
                </button>
                <button className="btn btn-primary" type="button" onClick={onSubmit}>
                    회원가입 완료
                </button>
            </div>
        </div>
    )
}
