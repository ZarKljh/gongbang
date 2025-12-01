'use client'

import { useEffect } from 'react'
import ErrorMessage from '@/app/auth/common/errorMessage'
import { addProductValidation } from '@/app/auth/hooks/addProductValidation'
import type { MainContentProps } from '../types/mainContent.types'

export type ProductModifyTabProps = Pick<
    MainContentProps,
    | 'isAuthenticated'
    | 'editMode'
    | 'passwordInput'
    | 'onVerifyPassword'
    | 'onEdit'
    | 'onCancel'
    | 'onSave'
    | 'onTempChange'
    | 'tempData'
    | 'globalCategoryOptions'
    | 'globalSubcategoryOptions'
    | 'productImages'
    | 'onProductImageChange'
>

export default function ProductModifyTab(props: ProductModifyTabProps) {
    const {
        isAuthenticated,
        editMode = {},
        passwordInput,
        tempData = {},
        onEdit,
        onCancel,
        onSave,
        onTempChange,
        onVerifyPassword,
        globalCategoryOptions = [],
        globalSubcategoryOptions = [],
        productImages = { PRODUCT_MAIN: null, PRODUCT: [] },
        onProductImageChange,
    } = props

    const { errors, validateField, validateAll } = addProductValidation()

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

    const hasMainImage = !!tempData.productMainImageUrl || !!productImages.PRODUCT_MAIN

    const isTextValid = requiredFields.every((f) => !!tempData[f])
    const noErrors = Object.values(errors).every((msg) => !msg)

    const isFormValid = editMode.productModify && isTextValid && hasMainImage && noErrors

    const filteredSubcategories = globalSubcategoryOptions.filter(
        (sub) => sub.categoryId === Number(tempData.categoryId),
    )

    const handleValidatedChange = (field: string, value: any) => {
        onTempChange(field, value)
        validateField(field as any, value, { ...tempData, [field]: value })
    }

    useEffect(() => {
        if (!editMode.productModify) return

        Object.keys(tempData).forEach((key) => {
            validateField(key as any, tempData[key], tempData)
        })

        validateField(
            'productMainImageUrl' as any,
            tempData.productMainImageUrl || productImages.PRODUCT_MAIN ? 'uploaded' : null,
            tempData,
        )
    }, [tempData, productImages, editMode.productModify])

    const handleSave = () => {
        const fullInfo = {
            ...tempData,
            productMainImageUrl: tempData.productMainImageUrl || (productImages.PRODUCT_MAIN ? 'uploaded' : null),
            productGalleryImageUrls: tempData.productGalleryImageUrls || [],
        }

        if (!validateAll(fullInfo as any)) {
            alert('입력값을 확인하세요.')
            return
        }

        onSave('productModify')
    }

    return (
        <div className="tab-content">
            {/* 인증 */}
            {!isAuthenticated ? (
                <div className="auth-banner">
                    <span>상품 수정을 위해 비밀번호 인증이 필요합니다.</span>
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

            {/* 헤더 */}
            <div className="section-header">
                <h2>상품 수정</h2>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-primary" disabled={!isFormValid} onClick={handleSave}>
                        저장
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            onCancel('productModify')
                        }}
                    >
                        취소
                    </button>
                </div>
            </div>

            {/* 수정 폼 */}
            {editMode.productModify && (
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

                    {/* slug */}
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
                            {filteredSubcategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 기본 가격 */}
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

                    {/* 재고 */}
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

                    {/* 대표이미지 */}
                    <div className="form-group">
                        <label className="form-label required">대표 이미지</label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onProductImageChange?.('PRODUCT_MAIN', e.target.files?.[0] ?? null)}
                        />

                        {tempData.productMainImageUrl && !productImages.PRODUCT_MAIN && (
                            <img
                                src={tempData.productMainImageUrl}
                                style={{ width: 150, marginTop: 10, borderRadius: 8 }}
                            />
                        )}

                        {productImages.PRODUCT_MAIN && (
                            <img
                                src={URL.createObjectURL(productImages.PRODUCT_MAIN)}
                                style={{ width: 150, marginTop: 10, borderRadius: 8 }}
                            />
                        )}
                    </div>

                    {/* 갤러리 이미지 */}
                    <div className="form-group">
                        <label>추가 이미지</label>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                                onProductImageChange?.('PRODUCT', e.target.files ? Array.from(e.target.files) : [])
                            }
                        />

                        {tempData.productGalleryImageUrls &&
                            tempData.productGalleryImageUrls.map((url: string, idx: number) => (
                                <img key={idx} src={url} style={{ width: 120, borderRadius: 8, marginRight: 10 }} />
                            ))}

                        {/* 새로 업로드된 이미지 */}
                        {productImages.PRODUCT?.map((file: File, idx: number) => (
                            <img
                                key={`new-${idx}`}
                                src={URL.createObjectURL(file)}
                                style={{ width: 120, borderRadius: 8, marginRight: 10 }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
