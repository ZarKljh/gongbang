'use client'
import { useState } from 'react'
import { MainContentProps } from '../types/mainContent.types'

import '../style/productListTab.css'

export default function ProductListTab(props: MainContentProps) {
    const {
        studio,
        productList,
        productPage,
        productPageSize,
        productHasNext,
        productLoading,
        setProductPage,
        setProductPageSize,
        fetchStudioProducts,

        // 🔐 인증 관련
        isAuthenticated,
        passwordInput,
        onTempChange,
        onVerifyPassword,
        productFilters,
        setProductFilters,
        categoryOptions,
        subcategoryOptions,
        onTabClick,
        onEdit,
    } = props

    console.log('📦 현재 productList:', props.productList)
    // // ===================== 검색 상태 =====================
    // const [searchFields, setSearchFields] = useState({
    //     name: true,
    //     category: true,
    //     subcategory: true,
    // })

    // 가격 범위
    const minPrice = productFilters.priceMin
    const maxPrice = productFilters.priceMax

    // 체크박스 조건들
    const [stockOption, setStockOption] = useState({ in: false, out: false })
    const [activeOption, setActiveOption] = useState({ on: false, off: false })
    const [statusOption, setStatusOption] = useState({
        SALE: false,
        PREPARE: false,
        STOP: false,
    })

    // 선택 삭제용 체크박스 배열
    const [checkedItems, setCheckedItems] = useState<number[]>([])

    // ======================= 🔍 검색 실행 =======================
    const handleSearch = () => {
        setProductFilters((prev) => ({
            ...prev,
            //keyword: prev.keyword, // 이미 state 입력창에서 업데이트됨
            // searchFields: Object.entries(searchFields)
            //     .filter(([k, v]) => v)
            //     .map(([k]) => k),

            priceMin: minPrice,
            priceMax: maxPrice,

            stock: Object.entries(stockOption)
                .filter(([k, v]) => v)
                .map(([k]) => k),

            active: Object.entries(activeOption)
                .filter(([k, v]) => v)
                .map(([k]) => k),

            status: Object.entries(statusOption)
                .filter(([k, v]) => v)
                .map(([k]) => k),
        }))
    }

    // ======================= 체크박스 토글 =======================
    const toggleAll = () => {
        if (checkedItems.length === productList.length) {
            setCheckedItems([])
        } else {
            setCheckedItems(productList.map((p) => p.product.id))
        }
    }

    const toggleItem = (id: number) => {
        setCheckedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    }

    // ======================= 삭제 기능 =======================
    const requireAuth = () => {
        alert('상품 관리를 위해 비밀번호 인증이 필요합니다.')
    }

    const handleDelete = (id: number) => {
        if (!isAuthenticated) return requireAuth()
        if (!confirm('정말 삭제하시겠습니까?')) return
        console.log('상품 삭제 요청:', id)
        // 🔥 삭제 API 호출 필요
    }

    const handleDeleteSelected = () => {
        if (!isAuthenticated) return requireAuth()
        if (checkedItems.length === 0) return alert('선택된 상품이 없습니다.')
        if (!confirm(`${checkedItems.length}개 상품을 삭제하시겠습니까?`)) return
        console.log('여러개 삭제 요청:', checkedItems)
        // 🔥 선택 삭제 API 호출 필요
    }

    const moveToAddPage = () => {
        if (!isAuthenticated) return requireAuth()
        //window.location.href = '/product/add'
        onTabClick('productAdd')
        onEdit('productAdd')
    }

    const moveToEditPage = (id: number) => {
        if (!isAuthenticated) return requireAuth()
        onTabClick('productModify')
        onEdit('productModify', id)
    }

    // ======================= 페이지 이동 =======================
    const changePage = (newPage: number) => {
        fetchStudioProducts(studio.studioId, newPage)
        setProductPage(newPage)
    }

    return (
        <div className="product-list-tab">
            {/* =====================================================
                🔐 비밀번호 인증 섹션
            ===================================================== */}
            {!isAuthenticated ? (
                <div className="auth-banner">
                    <span>상품 관리를 위해 비밀번호 인증이 필요합니다</span>
                    <div className="auth-banner-input">
                        <input
                            type="password"
                            placeholder="현재 비밀번호 입력"
                            value={passwordInput}
                            onChange={(e) => onTempChange && onTempChange('passwordInput', e.target.value)}
                        />
                        <button onClick={onVerifyPassword}>인증 확인</button>
                    </div>
                </div>
            ) : (
                <div className="auth-banner success">비밀번호 인증 완료</div>
            )}

            {/* =====================================================
                🔍 검색 박스
            ===================================================== */}
            <div className="search-box">
                <h3>상품 검색</h3>

                {/* 검색어 입력 */}
                <div className="filter-row">
                    <input
                        type="text"
                        value={productFilters.keyword}
                        onChange={(e) => setProductFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                        placeholder="상품명을 입력해주세요"
                    />
                    <button onClick={handleSearch}>검색</button>
                </div>

                {/* 카테고리 선택 */}
                <div className="filter-row">
                    <select
                        value={productFilters.category}
                        onChange={(e) => setProductFilters((prev) => ({ ...prev, category: e.target.value }))}
                    >
                        <option value="">전체 카테고리</option>

                        {categoryOptions.map((cat) => (
                            <optgroup key={cat.id} label={cat.name}>
                                {/* 카테고리 자체 선택 */}
                                <option value={`CAT:${cat.id}`}>{cat.name}</option>

                                {/* 서브카테고리 나열 */}
                                {cat.subcategories.map((sub) => (
                                    <option key={sub.id} value={`SUB:${sub.id}`}>
                                        └ {sub.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* 가격 범위 */}
                <div className="price-range-box">
                    <h4>가격 범위</h4>

                    <div className="price-inputs">
                        <div>
                            <label>최저가</label>
                            <input
                                type="number"
                                value={productFilters.priceMin}
                                min={0}
                                max={productFilters.priceMax}
                                onChange={(e) => {
                                    const v = Number(e.target.value)
                                    if (v <= productFilters.priceMax) {
                                        setProductFilters((prev) => ({ ...prev, priceMin: v }))
                                    }
                                }}
                            />
                        </div>

                        <div>
                            <label>최대가</label>
                            <input
                                type="number"
                                value={productFilters.priceMax}
                                min={productFilters.priceMin}
                                max={1000000}
                                onChange={(e) => {
                                    const v = Number(e.target.value)
                                    if (v >= productFilters.priceMin) {
                                        setProductFilters((prev) => ({ ...prev, priceMax: v }))
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="price-slider">
                        <div
                            className="slider-track"
                            style={{
                                left: `${(productFilters.priceMin / 100000) * 100}%`,
                                right: `${100 - (productFilters.priceMax / 100000) * 100}%`,
                            }}
                        ></div>
                        <input
                            type="range"
                            className="min"
                            min="0"
                            max="100000"
                            value={productFilters.priceMin}
                            onChange={(e) => {
                                const v = Number(e.target.value)
                                if (v <= productFilters.priceMax) {
                                    setProductFilters((prev) => ({ ...prev, priceMin: v }))
                                }
                            }}
                        />
                        <input
                            type="range"
                            className="max"
                            min="0"
                            max="100000"
                            value={productFilters.priceMax}
                            onChange={(e) => {
                                const v = Number(e.target.value)
                                if (v >= productFilters.priceMin) {
                                    setProductFilters((prev) => ({ ...prev, priceMax: v }))
                                }
                            }}
                        />
                    </div>

                    <div className="price-display">
                        {minPrice.toLocaleString()}원 ~ {maxPrice.toLocaleString()}원
                    </div>
                </div>

                {/* 기타 필터 */}
                <div className="filter-row">
                    <label>
                        <input
                            type="checkbox"
                            checked={stockOption.in}
                            onChange={(e) => setStockOption({ ...stockOption, in: e.target.checked })}
                        />{' '}
                        재고있음
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={stockOption.out}
                            onChange={(e) => setStockOption({ ...stockOption, out: e.target.checked })}
                        />{' '}
                        재고없음
                    </label>
                </div>

                <div className="filter-row">
                    <label>
                        <input
                            type="checkbox"
                            checked={activeOption.on}
                            onChange={(e) => setActiveOption({ ...activeOption, on: e.target.checked })}
                        />{' '}
                        판매중
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={activeOption.off}
                            onChange={(e) => setActiveOption({ ...activeOption, off: e.target.checked })}
                        />{' '}
                        판매중지
                    </label>
                </div>

                <div className="filter-row">
                    <label>
                        <input
                            type="checkbox"
                            checked={statusOption.SALE}
                            onChange={(e) => setStatusOption({ ...statusOption, SALE: e.target.checked })}
                        />{' '}
                        SALE
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={statusOption.PREPARE}
                            onChange={(e) => setStatusOption({ ...statusOption, PREPARE: e.target.checked })}
                        />{' '}
                        준비중
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={statusOption.STOP}
                            onChange={(e) => setStatusOption({ ...statusOption, STOP: e.target.checked })}
                        />{' '}
                        STOP
                    </label>
                </div>
            </div>

            {/* =====================================================
                버튼 그룹
            ===================================================== */}
            <div className="table-actions">
                <button onClick={handleDeleteSelected}>선택 삭제</button>
                <button onClick={moveToAddPage}>신규 상품 등록</button>
                <select
                    value={productPageSize}
                    onChange={(e) => {
                        const size = Number(e.target.value)
                        setProductPage(0) // 첫 페이지로 이동
                        setProductPageSize(size) // 부모 상태 변경
                        fetchStudioProducts(studio.studioId, 0) // 다시 호출
                    }}
                >
                    <option value={5}>5개씩</option>
                    <option value={10}>10개씩</option>
                    <option value={20}>20개씩</option>
                    <option value={30}>30개씩</option>
                </select>
            </div>

            {/* =====================================================
                상품 테이블
            ===================================================== */}
            <table className="product-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={checkedItems.length === productList.length}
                                onChange={toggleAll}
                            />
                        </th>
                        <th>상품명</th>
                        <th>카테고리</th>
                        <th>서브카테고리</th>
                        <th>가격</th>
                        <th>재고</th>
                        <th>판매활성</th>
                        <th>상태</th>
                        <th>관리</th>
                    </tr>
                </thead>

                <tbody>
                    {productLoading ? (
                        <tr>
                            <td colSpan={9}>로딩중...</td>
                        </tr>
                    ) : (
                        productList.map((item) => (
                            <tr key={item.product.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={checkedItems.includes(item.product.id)}
                                        onChange={() => toggleItem(item.product.id)}
                                    />
                                </td>
                                <td>{item.product.name}</td>
                                <td>{item.categoryName}</td>
                                <td>{item.subcategoryName}</td>
                                <td>{item.product.basePrice.toLocaleString()}원</td>
                                <td>{item.product.stockQuantity}</td>
                                <td>{item.product.active ? 'ON' : 'OFF'}</td>
                                <td>{item.product.status}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            onTempChange?.('productId', item.product.id)
                                            setSelectedProductId(item.product.id)
                                            onTabClick?.('productModify')
                                            onEdit?.('productModify')
                                        }}
                                    >
                                        수정
                                    </button>
                                    <button onClick={() => handleDelete(item.product.id)}>삭제</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* =====================================================
                페이지네이션
            ===================================================== */}
            <div className="pagination">
                <button disabled={productPage === 0} onClick={() => changePage(productPage - 1)}>
                    이전
                </button>

                <span>{productPage + 1} 페이지</span>

                <button disabled={!productHasNext} onClick={() => changePage(productPage + 1)}>
                    다음
                </button>
            </div>
        </div>
    )
}

/*

                <div className="filter-row">
                    <label>
                        <input
                            type="checkbox"
                            checked={searchFields.name}
                            onChange={(e) => setSearchFields({ ...searchFields, name: e.target.checked })}
                        />{' '}
                        상품명
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={searchFields.category}
                            onChange={(e) => setSearchFields({ ...searchFields, category: e.target.checked })}
                        />{' '}
                        카테고리
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={searchFields.subcategory}
                            onChange={(e) => setSearchFields({ ...searchFields, subcategory: e.target.checked })}
                        />{' '}
                        서브카테고리
                    </label>
                </div>

*/
