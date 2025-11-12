'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './Detail.module.css'

export default function detail() {
    const [count, setCount] = useState(1)
    const pricePerItem = 3500
    const total = pricePerItem * count

    const handleIncrease = () => setCount((prev) => prev + 1)
    const handleDecrease = () => setCount((prev) => (prev > 1 ? prev - 1 : 1))
    return (
        <>
            <div className={styles.detailPage}>
                <div className={styles.layout}>
                    {/* 왼쪽: 이미지 영역 */}
                    <section className={styles.imagePanel}>
                        <div className={styles.imageMain}>상품이미지</div>
                        {/* 필요하면 썸네일 영역 추가 */}
                        {/* <ul className={styles.thumbList}><li/><li/><li/></ul> */}
                    </section>

                    {/* 오른쪽: 구매 패널 */}
                    <section className={styles.purchaseSection}>
                        <h3 className={styles.productTitle}>방가방가 헴토리 랜덤 파우치</h3>

                        <div className={styles.productDesc}>
                            <p>일본 직수입 정품 15종 중 랜덤으로 한 가지가 나와요 :)</p>
                            <div className={styles.priceInfo}>
                                <span>판매가</span>
                                <strong>3,500원</strong>
                            </div>
                        </div>

                        <div className={styles.optionRow}>
                            <span>방가방가 헴토리 랜덤 파우치</span>

                            <div className={styles.quantityControl}>
                                <button className={styles.qtyBtn} onClick={handleDecrease}>
                                    −
                                </button>
                                <input type="number" value={count} readOnly className={styles.qtyInput} />
                                <button className={styles.qtyBtn} onClick={handleIncrease}>
                                    +
                                </button>
                            </div>

                            <span className={styles.optionTotal}>{total.toLocaleString()}원</span>
                        </div>

                        <div className={styles.totalRow}>
                            <span>total price :</span>
                            <strong>
                                {total.toLocaleString()} ({count}개)
                            </strong>
                        </div>

                        <div className={styles.buttonRow}>
                            <button className={styles.btnBuy}>바로구매하기</button>
                            <div className={styles.subButtons}>
                                <button className={styles.btnCart}>장바구니</button>
                                <button className={styles.btnFav}>♥</button>
                                {/* 공유버튼이 필요하면 */}
                                <button className={styles.btnShare}>↗</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}
