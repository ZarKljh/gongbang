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
    | 'onTabClick'
    | 'onTempChange'
    | 'tempData'
    | 'globalCategoryOptions'
    | 'globalSubcategoryOptions'
    | 'productImages'
    | 'onProductImageChange'
    | 'selectedProductId'
    | 'fetchProductDetail'
    | 'deleteSingleProduct'
    | 'resetProductState'
>

export default function ProductModifyTab(props: ProductModifyTabProps) {
    const {
        isAuthenticated,
        editMode = {},
        passwordInput = '',
        tempData = {},
        onEdit,
        onCancel,
        onSave,
        onTabClick,
        onTempChange,
        onVerifyPassword,
        globalCategoryOptions = [],
        globalSubcategoryOptions = [],
        productImages = { PRODUCT_MAIN: null, PRODUCT: [] },
        onProductImageChange,
        selectedProductId,
        fetchProductDetail,
        deleteSingleProduct,
        resetProductState,
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

    const hasMainImage = !!tempData.productMainImageName || !!productImages.PRODUCT_MAIN

    const isTextValid = requiredFields.every((f) => !!tempData[f])
    const noErrors = Object.values(errors).every((msg) => !msg)
    const isFormValid = editMode.productModify && isTextValid && hasMainImage && noErrors

    /** 🔥 서브카테고리 필터 */
    const filteredSubcategories = globalSubcategoryOptions.filter(
        (sub) => sub.categoryId === Number(tempData.categoryId),
    )

    /** 🔥 입력 + validation */
    const handleValidatedChange = (field: string, value: any) => {
        onTempChange(field, value)
        if (!editMode.productModify) return
        validateField(field as any, value, { ...tempData, [field]: value })
    }

    const handleDeleteProduct = async () => {
        if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return
        if (!tempData?.productId) return alert('상품 ID가 없습니다.')

        // 부모에게 삭제 요청
        await deleteSingleProduct?.(tempData.productId)

        // 삭제 후 수정 화면 종료
        resetProductState?.()
        onCancel?.('productList')
    }

    /** 🔥 editMode 켜지면 전체 유효성 체크 */
    /*
    useEffect(() => {
        if (!editMode.productModify) return
        if (!tempData.productId) return
        Object.keys(tempData).forEach((key) => {
            validateField(key as any, tempData[key], tempData)
        })

        validateField(
            'productMainImageUrl' as any,
            tempData.productMainImageName || productImages.PRODUCT_MAIN ? 'uploaded' : null,
            tempData,
        )
    }, [editMode.productModify])
    useEffect(() => {
        if (!editMode.productModify) return
        if (!selectedProductId) return

        // 상세 정보가 비어있을 때만 fetch
        if (!tempData.productId) {
            fetchProductDetail(selectedProductId)
        }
    }, [selectedProductId, editMode.productModify])
    */

    useEffect(() => {
        if (!selectedProductId) return
        if (tempData.productId) return // 이미 데이터 있으면 재요청 금지

        fetchProductDetail(selectedProductId)
    }, [selectedProductId])

    /** 🔥 저장 클릭 */
    const handleSave = () => {
        const fullInfo = {
            ...tempData,
            productMainImageUrl: tempData.productMainImageUrl || (productImages.PRODUCT_MAIN ? 'uploaded' : null),
        }

        if (!validateAll(fullInfo as any)) {
            alert('입력값을 확인하세요.')
            return
        }

        onSave('productModify')
    }

    /** ============================================
     *  🔥 대표 이미지 미리보기 처리
     * ============================================ */
    const serverImageUrl = (name: string) => `http://localhost:8090/images/${name}`

    const previewNewMain = productImages.PRODUCT_MAIN && URL.createObjectURL(productImages.PRODUCT_MAIN)

    const previewExistingMain = tempData.productMainImageName && serverImageUrl(tempData.productMainImageName)

    const previewMainImage = previewNewMain || previewExistingMain || null

    /* tempData가 준비 전 -> 로딩표시*/
    if (editMode.productModify && !tempData?.productId) {
        return <div className="tab-content">상품 정보를 불러오는 중...</div>
    }

    return (
        <div className="tab-content">
            {/* ==================== 인증 ==================== */}
            {!isAuthenticated && (
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
            )}

            {isAuthenticated && <div className="auth-banner success">비밀번호 인증 완료</div>}

            {/* ==================== 헤더 ==================== */}
            <div className="section-header">
                <h2>상품 수정</h2>

                {!editMode.productModify ? (
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-primary" onClick={() => onEdit?.('productModify')}>
                            수정
                        </button>
                        <button className="btn-secondary" onClick={() => onEdit?.('handleDeleteProduct')}>
                            삭제
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                resetProductState?.()
                                onTabClick?.('productList')
                            }}
                        >
                            목록으로
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-primary" disabled={!isFormValid} onClick={handleSave}>
                            저장
                        </button>
                        <button className="btn-secondary" onClick={() => onCancel?.('productModify')}>
                            취소
                        </button>
                    </div>
                )}
            </div>

            {/* ==================== 상품 상세 보기 ==================== */}
            {!editMode.productModify && tempData?.productId && (
                <div className="product-view">
                    <div className="form-group">
                        <label>상품명</label>
                        <p>{tempData.name}</p>
                    </div>

                    <div className="form-group">
                        <label>Slug</label>
                        <p>{tempData.slug}</p>
                    </div>

                    <div className="form-group">
                        <label>카테고리</label>
                        <p>{tempData.categoryName}</p>
                    </div>

                    <div className="form-group">
                        <label>서브카테고리</label>
                        <p>{tempData.subcategoryName || '선택 없음'}</p>
                    </div>

                    <div className="form-group">
                        <label>가격</label>
                        <p>{tempData.basePrice} 원</p>
                    </div>

                    <div className="form-group">
                        <label>재고</label>
                        <p>{tempData.stockQuantity}</p>
                    </div>

                    {/* 대표 이미지 — studioTab의 이미지 영역 스타일과 동일하게 적용 */}
                    <div className="form-group">
                        <label>대표 이미지</label>
                        <div className="image-field">
                            <div className="image-preview-wide">
                                {previewMainImage && <img src={previewMainImage} alt="대표 이미지" />}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 데이터가 아직 없을 때 */}
            {!editMode.productModify && !tempData?.productId && <div>상품 정보를 불러오는 중...</div>}
            {/* ===================================================
                  🔥 수정 모드 ON → 입력폼 표시
            =================================================== */}
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

                            {filteredSubcategories.length > 0 &&
                                filteredSubcategories.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* 가격 */}
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
                    {/* 새로운 메인이미지 등록폼 start */}
                    <div className="form-group">
                        <label className="form-label required">대표 이미지</label>

                        {/* 오른쪽 전체 영역 */}
                        <div className="image-field">
                            {/* 파일명 + 버튼 */}
                            <div className="image-file-row">
                                <div className="file-name-box">
                                    {productImages?.PRODUCT_MAIN
                                        ? productImages.PRODUCT_MAIN.name
                                        : tempData.productMainImageName || ''}
                                </div>

                                {editMode.productModify && (
                                    <button
                                        className="upload-btn"
                                        type="button"
                                        onClick={() => document.getElementById('productMainImageInput')?.click()}
                                    >
                                        파일선택
                                    </button>
                                )}

                                <input
                                    id="productMainImageInput"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            onProductImageChange?.('PRODUCT_MAIN', e.target.files[0])
                                        }
                                    }}
                                />
                            </div>

                            {/* 미리보기 박스 */}
                            <div className="image-preview-wide">
                                {previewMainImage && <img src={previewMainImage} alt="대표 이미지" />}
                            </div>
                        </div>
                    </div>
                    {/* 새로운 메인이미지 등록폼 end */}
                    <ErrorMessage message={errors.productMainImageUrl} />

                    {/* backorderable */}
                    <div className="form-group">
                        <label className="form-label required">백오더 가능 여부</label>
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
                        <label className="form-label required">상품 활성화</label>
                        <select
                            className="editable"
                            value={tempData.active || ''}
                            onChange={(e) => handleValidatedChange('active', e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            <option value="true">활성</option>
                            <option value="false">비활성</option>
                        </select>
                    </div>
                    <ErrorMessage message={errors.active} />

                    {/* status */}
                    <div className="form-group">
                        <label className="form-label required">상품 상태</label>
                        <select
                            className="editable"
                            value={tempData.status || ''}
                            onChange={(e) => handleValidatedChange('status', e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            <option value="DRAFT">임시저장</option>
                            <option value="PUBLISHED">판매중</option>
                            <option value="UNPUBLISHED">중단중</option>
                        </select>
                    </div>
                    <ErrorMessage message={errors.status} />
                </div>
            )}
        </div>
    )
}
