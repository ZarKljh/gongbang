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

export interface StudioTabProps {
    activeSubTab: string
    onSubTabClick: (tab: string) => void
    userData: any
    stats: any
    studioList: any[]
    studio: any
}

export default function StudioTab(props: StudioTabProps) {
    return <div className="tab-content"></div>
}

/*
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
                <h2>회원정보수정</h2>
                {!editMode.profile ? (
                    <button className="btn-primary" onClick={() => onEdit('profile')}>
                        수정
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={() => onSave('profile')}>
                            저장
                        </button>
                        <button className="btn-secondary" onClick={() => onCancel('profile')}>
                            취소
                        </button>
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
