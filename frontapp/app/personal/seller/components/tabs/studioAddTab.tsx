'use client'

import { CATEGORY_OPTIONS } from '@/app/auth/signup/seller/component/studioCategoryList'
import type { MainContentProps } from '../types/mainContent.types'

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

    return (
        <div className="tab-content">
            {/* 🔐 인증 배너 */}
            {!isAuthenticated ? (
                <div className="auth-banner">
                    <span>공방 등록을 위해 비밀번호 인증이 필요합니다</span>
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

            {/* 헤더 */}
            <div className="section-header">
                <h2>신규공방등록</h2>

                {!editMode.studioAdd ? (
                    <button className="btn-primary" onClick={() => onEdit('studioAdd')}>
                        신규 등록
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={() => onSave('studioAdd')}>
                            저장
                        </button>
                        <button className="btn-secondary" onClick={() => onCancel('studioAdd')}>
                            취소
                        </button>
                    </div>
                )}
            </div>

            {/* =============================== */}
            {/*   1. 신규 등록이 아닐 때 → 리스트   */}
            {/* =============================== */}
            {!editMode.studioAdd && (
                <div className="studio-list">
                    {studioList.length === 0 ? (
                        <p>등록된 공방이 없습니다.</p>
                    ) : (
                        studioList.map((studio) => (
                            <div key={studio.studioId} className="studio-item">
                                <img
                                    src={`http://localhost:8090/images/${studio.studioLogoImage.imageFileName}`}
                                    alt="logo"
                                    width={80}
                                    height={80}
                                    style={{ borderRadius: 8, objectFit: 'cover' }}
                                />
                                <div className="info">
                                    <h3>{studio.studioName}</h3>
                                    <p>{studio.studioDescription}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ================================ */}
            {/*  2. 신규 등록 모드일 때 → Form   */}
            {/* ================================ */}
            {editMode.studioAdd && (
                <div className="studio-add-form">
                    <div className="form-group">
                        <label>사업자번호</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioBusinessNumber || ''}
                            onChange={(e) => onTempChange('studioBusinessNumber', e.target.value)}
                        />
                    </div>
                    {/* 카테고리 */}
                    <div className="form-group">
                        <label>카테고리</label>
                        <select
                            className="editable"
                            value={tempData.categoryId || ''}
                            onChange={(e) => onTempChange('categoryId', e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            {CATEGORY_OPTIONS.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 공방 이름 */}
                    <div className="form-group">
                        <label>공방 이름</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioName || ''}
                            onChange={(e) => onTempChange('studioName', e.target.value)}
                        />
                    </div>

                    {/* 상세설명 */}
                    <div className="form-group">
                        <label>상세설명</label>
                        <textarea
                            className="editable"
                            rows={5}
                            value={tempData.studioDescription || ''}
                            onChange={(e) => onTempChange('studioDescription', e.target.value)}
                        />
                    </div>
                    {/* 대표 번호 */}
                    <div className="form-group">
                        <label>공방 대표번호</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioMobile || ''}
                            onChange={(e) => onTempChange('studioMobile', e.target.value)}
                        />
                    </div>
                    {/* 사무실전화번호 */}
                    <div className="form-group">
                        <label>사무실전화번호</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioOfficeTell || ''}
                            onChange={(e) => onTempChange('studioOfficeTell', e.target.value)}
                        />
                    </div>
                    {/* 팩스 */}
                    <div className="form-group">
                        <label>팩스</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioFax || ''}
                            onChange={(e) => onTempChange('studioFax', e.target.value)}
                        />
                    </div>
                    {/* 이메일 */}
                    <div className="form-group">
                        <label>이메일</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioEmail || ''}
                            onChange={(e) => onTempChange('studioEmail', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>주소</label>

                        {/* 우편번호 + 검색 버튼 */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                className="editable"
                                placeholder="우편번호"
                                value={tempData.studioAddPostNumber || ''}
                                onChange={(e) => onTempChange('studioAddPostNumber', e.target.value)}
                                style={{ width: '140px' }}
                            />
                            <button type="button" className="btn-secondary" onClick={onAddressSearch}>
                                주소 검색
                            </button>
                        </div>

                        {/* 기본주소 */}
                        <input
                            type="text"
                            className="editable"
                            placeholder="기본주소"
                            style={{ marginTop: 8 }}
                            value={tempData.studioAddMain || ''}
                            onChange={(e) => onTempChange('studioAddMain', e.target.value)}
                        />
                        {/* 상세주소 */}
                        <input
                            type="text"
                            className="editable"
                            placeholder="상세주소"
                            style={{ marginTop: 8 }}
                            value={tempData.studioAddDetail || ''}
                            onChange={(e) => onTempChange('studioAddDetail', e.target.value)}
                        />
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
                    </div>
                    {/* 갤러리 이미지 */}
                    <div className="form-group">
                        <label>갤러리 이미지 (최대 5장)</label>
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
                    </div>
                </div>
            )}
        </div>
    )
}
