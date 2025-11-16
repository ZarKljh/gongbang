// components/tabs/StudioDescriptionTab.tsx
import ReactMarkdown from 'react-markdown'

// components/types/studioDescriptionTab.types.ts
import type { MainContentProps } from '../types/mainContent.types'

export type StudioDescriptionTabProps = Pick<
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
>

export default function StudioDescriptionTab(props: StudioDescriptionTabProps) {
    const {
        isAuthenticated = false,
        editMode = {},
        passwordInput = '',
        tempData = {},
        studio = {},
        onTempChange,
        onVerifyPassword,
        onEdit,
        onSave,
        onCancel,
    } = props

    return (
        <div className="tab-content">
            {/* 인증 배너 */}
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

            {/* 헤더 및 버튼 */}
            <div className="section-header">
                <h2>공방 상세설명</h2>

                {!editMode.studioDesc ? (
                    <button className="btn-primary" onClick={() => onEdit('studioDesc')}>
                        수정
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={() => onSave('studioDesc')}>
                            저장
                        </button>
                        <button className="btn-secondary" onClick={() => onCancel('studioDesc')}>
                            취소
                        </button>
                    </div>
                )}
            </div>

            {/* 상세설명 출력 or 편집 */}
            {!editMode.studioDesc ? (
                <div className="markdown-view">
                    <ReactMarkdown>{studio.studioDescription || '등록된 상세설명이 없습니다.'}</ReactMarkdown>
                </div>
            ) : (
                <textarea
                    className="markdown-editor"
                    value={tempData.studioDescription || ''}
                    onChange={(e) => onTempChange('studioDescription', e.target.value)}
                    placeholder="Markdown 문법으로 공방 상세설명을 작성하세요."
                    rows={18}
                />
            )}
        </div>
    )
}
