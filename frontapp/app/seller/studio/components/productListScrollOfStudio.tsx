'use client'

import React, { useEffect, useState } from 'react'
import '../style/studio.css'

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
    imageUrl: string
}

interface ProductListInfiniteProps {
    studioId: number | string
}

export default function ProductListInfinite({ studioId }: ProductListInfiniteProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [page, setPage] = useState(0)
    const [hasNext, setHasNext] = useState(true)
    const [loading, setLoading] = useState(false)

    const fetchProducts = async (pageNumber: number) => {
        if (loading || !hasNext) return
        setLoading(true)
        try {
            const response = await fetch(
                `http://localhost:8090/api/v1/studio/${studioId}/products?page=${pageNumber}&size=5`,
                {
                    method: 'GET',
                    credentials: 'include',
                },
            )
            const result = await response.json()
            const newProducts = result.data.content
            setProducts((prev) => [...prev, ...newProducts])
            setHasNext(!result.data.last)
            setPage(result.data.number + 1)
        } catch (error) {
            console.error('상품 로딩 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (studioId) {
            fetchProducts(0)
        }
    }, [studioId])

    useEffect(() => {
        const handleScroll = () => {
            const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
            if (bottom) fetchProducts(page)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [page, hasNext, loading])

    return (
        <div className="product-list">
            <h2 className="product-list-title">상품 리스트 (무한스크롤)</h2>
            {products.length === 0 ? (
                <p>등록된 상품이 없습니다.</p>
            ) : (
                <ul className="product-grid">
                    {products.map((product) => (
                        <li className="product-card" key={product.id}>
                            <img
                                className="product-image"
                                src={product.imageUrl || '/default-product.png'} // 기본 이미지 설정 가능
                                alt={product.name}
                            />
                            <div className="product-info">
                                <div className="product-name">상품명 : {product.name}</div>
                                <div className="product-price">가격: {product.basePrice.toLocaleString()}원</div>
                                <div className="product-stock">재고: {product.stockQuantity}개</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {loading && <p>로딩 중...</p>}
            {!hasNext && <p>모든 상품을 불러왔습니다.</p>}
        </div>
    )

    /*
    <h4>상품명 : {product.name}</h4>
                            <p>카테고리 : {product.subtitle}</p>
                            <p>상품설명 : {product.summary}</p>
                            <p>💰 가격: {product.basePrice.toLocaleString()}원</p>
                            <p>📦 재고: {product.stockQuantity}개</p>
                            <p>📌 상태: {product.status}</p>
                            <p>🔍 SEO 제목: {product.seoTitle}</p>
                            <p>📝 SEO 설명: {product.seoDescription}</p>
    */
}
