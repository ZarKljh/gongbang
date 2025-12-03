'use client'

import { useEffect } from 'react'
import ErrorMessage from '@/app/auth/common/errorMessage'
import { addProductValidation } from '@/app/auth/hooks/addProductValidation'
import type { MainContentProps } from '../types/mainContent.types'

export type AddProductTabProps = Pick<
    MainContentProps,
    | 'isAuthenticated'
    | 'editMode'
    | 'passwordInput'
    | 'onVerifyPassword'
    | 'onEdit'
    | 'onTabClick'
    | 'onCancel'
    | 'onSave'
    | 'onTempChange'
    | 'tempData'
    | 'categoryOptions'
    | 'subcategoryOptions'
    | 'productImages'
    | 'onProductImageChange'
    | 'globalCategoryOptions'
    | 'globalSubcategoryOptions'
>

/** 🔥 ProductAddTab Component */
export default function AddProductTab(props: AddProductTabProps) {
    const {
        isAuthenticated = false,
        editMode = {},
        passwordInput = '',
        tempData = {},
        categoryOptions = [],
        subcategoryOptions = [],
        productImages = {},
        onTempChange,
        onVerifyPassword,
        onTabClick,
        onEdit,
        onCancel,
        onSave,
        onProductImageChange,
        globalCategoryOptions = [],
        globalSubcategoryOptions = [],
    } = props

    /** =============================
     *  🔥 validation Hook
     * ============================= */
    const { errors, validateField, validateAll } = addProductValidation()

    /** 텍스트 필수값 목록 */
    const requiredFields = [
        'name',
        'slug',
        'categoryId',
        'basePrice',
        'stockQuantity',
        'backorderable',
        'active',
        'status',
    ] as const

    /** ⭐ 대표 이미지 필수 */
    const hasMainImage = !!productImages.PRODUCT_MAIN

    /** 텍스트 필수값 충족 여부 */
    const isTextValid = requiredFields.every((f) => !!tempData[f])

    /** 에러가 모두 비어 있는지 확인 */
    const noErrors = Object.values(errors).every((msg) => !msg)

    /** ⭐ 최종 폼 유효 */
    const isFormValid =
        editMode.productAdd &&
        isTextValid &&
        hasMainImage && // ⭐ 대표 이미지 필수 포함
        noErrors

    /** 선택된 카테고리의 종속된 서브카테고리 필터링*/
    const filteredSubcategories = globalSubcategoryOptions.filter(
        (sub) => sub.categoryId === Number(tempData.categoryId),
    )

    /** =============================
     *  🔥 실시간 validate + temp 변경
     * ============================= */
    const handleValidatedChange = (field: string, value: any) => {
        onTempChange(field, value)
        validateField(field as any, value, { ...tempData, [field]: value })
    }

    /** =============================
     *  🔥 신규 등록 모드가 켜지면 전체 재검증
     * ============================= */
    useEffect(() => {
        if (!editMode.productAdd) return

        Object.keys(tempData).forEach((key) => {
            validateField(key as any, tempData[key], tempData)
        })

        validateField('productMainImageUrl' as any, productImages.PRODUCT_MAIN ? 'uploaded' : null, tempData)
    }, [tempData, productImages, editMode.productAdd])

    /** =============================
     *  🔥 저장 버튼
     * ============================= */
    const handleSave = () => {
        const fullInfo = {
            ...tempData,
            productMainImageUrl: productImages.PRODUCT_MAIN ? 'uploaded' : null,
            productGalleryImageUrls: productImages.PRODUCT ?? [],
        }

        const ok = validateAll(fullInfo as any)
        if (!ok) {
            alert('입력값을 확인해주세요.')
            return
        }

        onSave('productAdd')
    }

    return (
        <div className="tab-content">
            {/* ===================================================
                 🔐 인증 배너
            =================================================== */}
            {!isAuthenticated ? (
                <div className="auth-banner">
                    <span>상품 등록을 위해 비밀번호 인증이 필요합니다.</span>
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
                <div className="auth-banner success">비밀번호 인증 완료</div>
            )}

            {/* ===================================================
                 헤더 영역
            =================================================== */}
            <div className="section-header">
                <h2>신규 상품 등록</h2>

                {!editMode.productAdd ? (
                    <button className="btn-primary" onClick={() => onEdit('productAdd')}>
                        신규 등록
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" onClick={handleSave} disabled={!isFormValid}>
                            저장
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                onCancel('productAdd')
                                onTabClick?.('productList')
                            }}
                        >
                            취소
                        </button>
                    </div>
                )}
            </div>

            {!editMode.productAdd && (
                <div style={{ padding: 20 }}>
                    <p>상품 등록을 진행하시려면 "신규 등록" 버튼을 누르세요.</p>
                </div>
            )}

            {/* ===================================================
                 신규 등록 Form
            =================================================== */}
            {editMode.productAdd && (
                <div className="product-add-form">
                    {/* 상품명 */}
                    <div className="form-group">
                        <label className="form-label required">상품명</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.name || ''}
                            onChange={(e) => handleValidatedChange('name', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.name} />

                    {/* Slug */}
                    <div className="form-group">
                        <label className="form-label required">Slug</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.slug || ''}
                            onChange={(e) => handleValidatedChange('slug', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.slug} />

                    {/* 카테고리 */}
                    <div className="form-group">
                        <label className="form-label required">카테고리</label>
                        <select
                            className="editable"
                            value={tempData.categoryId || ''}
                            onChange={(e) => handleValidatedChange('categoryId', e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            {globalCategoryOptions.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <ErrorMessage message={errors.categoryId} />

                    {/* 서브카테고리 */}
                    <div className="form-group">
                        <label>서브카테고리</label>
                        <select
                            className="editable"
                            value={tempData.subcategoryId || ''}
                            onChange={(e) => handleValidatedChange('subcategoryId', e.target.value)}
                        >
                            <option value="">선택 안함</option>
                            {filteredSubcategories.length > 0 &&
                                filteredSubcategories.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* subtitle */}
                    <div className="form-group">
                        <label>부제목</label>
                        <input
                            type="text"
                            className="editable"
                            value={tempData.subtitle || ''}
                            onChange={(e) => handleValidatedChange('subtitle', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.subtitle} />

                    {/* basePrice */}
                    <div className="form-group">
                        <label className="form-label required">가격(원)</label>
                        <input
                            type="number"
                            className="editable"
                            value={tempData.basePrice || ''}
                            onChange={(e) => handleValidatedChange('basePrice', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.basePrice} />

                    {/* stock */}
                    <div className="form-group">
                        <label className="form-label required">재고</label>
                        <input
                            type="number"
                            className="editable"
                            value={tempData.stockQuantity || ''}
                            onChange={(e) => handleValidatedChange('stockQuantity', e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errors.stockQuantity} />

                    {/* backorderable */}
                    <div className="form-group">
                        <label className="form-label required">백오더</label>
                        <select
                            className="editable"
                            value={tempData.backorderable || ''}
                            onChange={(e) => handleValidatedChange('backorderable', e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            <option value="true">가능</option>
                            <option value="false">불가</option>
                        </select>
                    </div>
                    <ErrorMessage message={errors.backorderable} />

                    {/* active */}
                    <div className="form-group">
                        <label className="form-label required">활성</label>
                        <select
                            className="editable"
                            value={tempData.active || ''}
                            onChange={(e) => handleValidatedChange('active', e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            <option value="true">판매중</option>
                            <option value="false">판매중지</option>
                        </select>
                    </div>
                    <ErrorMessage message={errors.active} />

                    {/* status */}
                    <div className="form-group">
                        <label className="form-label required">Status</label>
                        <select
                            className="editable"
                            value={tempData.status || ''}
                            onChange={(e) => handleValidatedChange('status', e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="ACTIVE">ACTIVE</option>
                        </select>
                    </div>
                    <ErrorMessage message={errors.status} />

                    {/* ===================================================
                        대표 이미지 (필수)
                    =================================================== */}

                    <div className="form-group">
                        <label className="form-label required">대표 이미지</label>

                        <div className="image-field">
                            {/* 파일명 + 버튼 */}
                            <div className="image-file-row">
                                <div className="file-name-box">
                                    {productImages.PRODUCT_MAIN ? productImages.PRODUCT_MAIN.name : ''}
                                </div>

                                <button
                                    className="upload-btn"
                                    type="button"
                                    onClick={() => document.getElementById('productMainImageInput')?.click()}
                                >
                                    파일선택
                                </button>

                                <input
                                    id="productMainImageInput"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) =>
                                        onProductImageChange?.('PRODUCT_MAIN', e.target.files?.[0] ?? null)
                                    }
                                />
                            </div>

                            {/* 미리보기 박스 */}
                            <div className="image-preview-wide">
                                {productImages.PRODUCT_MAIN && (
                                    <img src={URL.createObjectURL(productImages.PRODUCT_MAIN)} alt="대표 이미지" />
                                )}
                            </div>
                        </div>
                    </div>

                    <ErrorMessage message={errors.productMainImageUrl} />

                    {/* ===================================================
                        추가 이미지 여러 장
                    =================================================== */}
                    <div className="form-group">
                        <label className="form-label">추가 이미지</label>

                        <div className="image-field">
                            {/* 파일명 + 선택 버튼 */}
                            <div className="image-file-row">
                                <div className="file-name-box">
                                    {productImages.PRODUCT && productImages.PRODUCT.length > 0
                                        ? `${productImages.PRODUCT.length}개의 파일`
                                        : ''}
                                </div>

                                <button
                                    className="upload-btn"
                                    type="button"
                                    onClick={() => document.getElementById('productGalleryImageInput')?.click()}
                                >
                                    파일선택
                                </button>

                                <input
                                    id="productGalleryInput"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            onProductImageChange?.('PRODUCT', Array.from(e.target.files))
                                        }
                                    }}
                                />
                            </div>

                            {/* ==========================
                                갤러리 이미지 프리뷰 (5열 그리드 + 삭제 버튼)
                            =========================== */}

                            <div className="gallery-container">
                                <div className="gallery-wrapper">
                                    {(productImages?.PRODUCT ?? []).map((file, idx) => (
                                        <div key={idx} className="gallery-item">
                                            <img src={URL.createObjectURL(file)} alt="" />
                                            <button
                                                className="gallery-delete-btn"
                                                onClick={() => {
                                                    const newList = productImages.PRODUCT.filter((_, i) => i !== idx)
                                                    onProductImageChange?.('PRODUCT', newList)
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/*

<div className="form-group">
                        <label className="form-label required">대표 이미지</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onProductImageChange?.('PRODUCT_MAIN', e.target.files?.[0] ?? null)}
                        />

                        {productImages.PRODUCT_MAIN && (
                            <img
                                src={URL.createObjectURL(productImages.PRODUCT_MAIN)}
                                style={{ width: 150, marginTop: 10, borderRadius: 8 }}
                            />
                        )}

                        <ErrorMessage message={errors.productMainImageUrl} />
                    </div>


*/
