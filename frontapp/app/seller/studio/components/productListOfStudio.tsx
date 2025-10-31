'use client'

import React from 'react'

interface Product {
    id: number
    name: string
    subtitle: string
    summary: string
    description: string
    basePrice: number
    stockQuantity: number
    slug: string
    status: string
    active: boolean
    categoryId: number
    subcategoryId: number
    themeId: number
    seoTitle: string
    seoDescription: string
}

interface ProductListProps {
    products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
    return (
        <section>
            <h2>상품 리스트</h2>
            {products.length === 0 ? (
                <p>등록된 상품이 없습니다.</p>
            ) : (
                <ul>
                    {products.map((product) => (
                        <li key={product.id} style={{ marginBottom: '1rem' }}>
                            <h4>상품명 : {product.name}</h4>
                            <p>카테고리 : {product.subtitle}</p>
                            <p>상품설명 : {product.summary}</p>
                            <p>💰 가격: {product.basePrice.toLocaleString()}원</p>
                            <p>📦 재고: {product.stockQuantity}개</p>
                            <p>📌 상태: {product.status}</p>
                            <p>🔍 SEO 제목: {product.seoTitle}</p>
                            <p>📝 SEO 설명: {product.seoDescription}</p>
                            <hr />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
