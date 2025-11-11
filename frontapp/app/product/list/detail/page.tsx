'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './Detail.module.css'

export default function detail() {
    return (
        <>
            <div className={styles.pageWrapper}>
                <div className={styles.productDetail}>
                    <div className={styles.productImage}>상품이미지</div>

                    <div className={styles.productInfo}>
                        <div className={styles.sellerHeader}>
                            <span>상품의 셀러 프로필</span>
                            <span>팔로우</span>
                        </div>

                        <div className={styles.productOptions}>
                            <p>상품옵션 선택</p>
                            <input type="text" placeholder="옵션 1" />
                            <input type="text" placeholder="옵션 2" />
                            <input type="text" placeholder="옵션 3" />
                        </div>

                        <div className={styles.actionButtons}>
                            <button>장바구니</button>
                            <button>구매/결제</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
