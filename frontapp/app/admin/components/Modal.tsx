'use client'

import { useEffect, useId, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from '@/app/admin/styles/MySection.module.css'

type ModalProps = {
    open: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
    closeOnBackdrop?: boolean
}

function getFocusableElements(root: HTMLElement | null) {
    if (!root) return []
    const selectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    return Array.from(root.querySelectorAll<HTMLElement>(selectors)).filter((el) => {
        // display none / visibility hidden 제외
        const style = window.getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden'
    })
}

export default function Modal({ open, onClose, title, children, size = 'md', closeOnBackdrop = true }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement | null>(null)
    const lastActiveElRef = useRef<HTMLElement | null>(null)

    const reactId = useId()
    const titleId = useMemo(() => `modal-title-${reactId}`, [reactId])

    useEffect(() => {
        if (!open) return

        // 열릴 때: 기존 포커스 저장
        lastActiveElRef.current = document.activeElement as HTMLElement | null

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
                return
            }

            // 간단 포커스 트랩 (Tab 순환)
            if (e.key === 'Tab') {
                const root = dialogRef.current
                const focusables = getFocusableElements(root)
                if (focusables.length === 0) return

                const first = focusables[0]
                const last = focusables[focusables.length - 1]
                const active = document.activeElement as HTMLElement | null

                if (e.shiftKey) {
                    if (!active || active === first) {
                        e.preventDefault()
                        last.focus()
                    }
                } else {
                    if (active === last) {
                        e.preventDefault()
                        first.focus()
                    }
                }
            }
        }

        document.addEventListener('keydown', onKey)

        // 스크롤 잠금
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        // 최초 포커스: 모달 안 첫 focusable 또는 닫기 버튼/다이얼로그
        window.setTimeout(() => {
            const root = dialogRef.current
            const focusables = getFocusableElements(root)
            if (focusables.length > 0) focusables[0].focus()
            else root?.focus()
        }, 0)

        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = prevOverflow

            // 닫힐 때: 원래 포커스로 복귀
            lastActiveElRef.current?.focus?.()
            lastActiveElRef.current = null
        }
    }, [open, onClose])

    if (!open) return null

    const sizeClass = size === 'sm' ? styles.modalSm : size === 'lg' ? styles.modalLg : styles.modalMd

    return createPortal(
        <div className={styles.modalRoot}>
            {/* 어두운 배경 */}
            <div className={styles.modalBackdrop} onClick={() => closeOnBackdrop && onClose()} aria-hidden="true" />

            {/* 모달 박스 */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                className={`${styles.modalDialog} ${sizeClass}`}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1} // focus fallback
            >
                <div className={styles.modalHeader}>
                    <h2 id={titleId} className={styles.modalTitle}>
                        {title ?? '알림'}
                    </h2>
                    <button type="button" onClick={onClose} className={styles.modalCloseButton} aria-label="닫기">
                        ✕
                    </button>
                </div>

                <div className={styles.modalBody}>{children}</div>
            </div>
        </div>,
        document.body,
    )
}
