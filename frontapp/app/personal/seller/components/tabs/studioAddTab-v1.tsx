'use client'

import { CATEGORY_OPTIONS } from '@/app/auth/signup/seller/component/studioCategoryList'
import type { MainContentProps } from '../types/mainContent.types'

export type StudioAddTabProps = Pick<
    MainContentProps,
    | 'userData'
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
                <h2>공방 신규 등록</h2>

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

            {/* 신규 등록 Form */}
            {editMode.studioAdd && (
                <div>
                    {/* ▶ 카테고리 */}
                    <div className="form-group">
                        <label>카테고리</label>
                        <select
                            className="editable"
                            value={tempData.categoryId || ''}
                            onChange={(e) => onTempChange('categoryId', e.target.value)}
                        >
                            <option value="" disabled>
                                선택해주세요
                            </option>
                            {CATEGORY_OPTIONS.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ▶ 공방 이름 */}
                    <div className="form-group">
                        <label>공방이름</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.studioName || ''}
                            onChange={(e) => onTempChange('studioName', e.target.value)}
                        />
                    </div>

                    {/* ▶ 상세설명 */}
                    <div className="form-group">
                        <label>상세설명</label>
                        <textarea
                            className="editable"
                            rows={5}
                            value={tempData.studioDescription || ''}
                            onChange={(e) => onTempChange('studioDescription', e.target.value)}
                        />
                    </div>

                    {/* ▶ 대표 이미지 */}
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
                                style={{ width: 150, marginTop: 10 }}
                            />
                        )}
                    </div>

                    {/* ▶ 로고 이미지 */}
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
                                style={{ width: 150, marginTop: 10 }}
                            />
                        )}
                    </div>

                    {/* ▶ 갤러리 이미지 (여러 장) */}
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
                            <div style={{ display: 'flex', gap: '10px', marginTop: 10 }}>
                                {studioImages.STUDIO.map((file, idx) => (
                                    <img key={idx} src={URL.createObjectURL(file)} style={{ width: 120 }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
