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
        const style = window.getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden'
    })
}

export default function Modal({ open, onClose, title, children, size = 'md', closeOnBackdrop = true }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement | null>(null)
    const lastActiveElRef = useRef<HTMLElement | null>(null)

    // ✅ 핵심: onClose를 ref로 고정해서 effect 의존성에서 제거
    const onCloseRef = useRef(onClose)
    useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])

    const reactId = useId()
    const titleId = useMemo(() => `modal-title-${reactId}`, [reactId])

    // ✅ open만 의존: 입력/렌더로 effect cleanup 재실행되지 않음
    useEffect(() => {
        if (!open) return

        // 열릴 때: 기존 포커스 저장
        lastActiveElRef.current = document.activeElement as HTMLElement | null

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onCloseRef.current()
                return
            }

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

        // 최초 포커스 (오픈 “한 번”만)
        const t = window.setTimeout(() => {
            const root = dialogRef.current
            const focusables = getFocusableElements(root)
            if (focusables.length > 0) focusables[0].focus()
            else root?.focus()
        }, 0)

        return () => {
            window.clearTimeout(t)
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = prevOverflow

            // 닫힐 때: 원래 포커스로 복귀
            lastActiveElRef.current?.focus?.()
            lastActiveElRef.current = null
        }
    }, [open])

    if (!open) return null

    const sizeClass = size === 'sm' ? styles.modalSm : size === 'lg' ? styles.modalLg : styles.modalMd

    return createPortal(
        <div className={styles.modalRoot}>
            <div
                className={styles.modalBackdrop}
                onClick={() => {
                    if (closeOnBackdrop) onCloseRef.current()
                }}
                aria-hidden="true"
            />

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                className={`${styles.modalDialog} ${sizeClass}`}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >
                <div className={styles.modalHeader}>
                    <h2 id={titleId} className={styles.modalTitle}>
                        {title ?? '알림'}
                    </h2>
                    <button
                        type="button"
                        onClick={() => onCloseRef.current()}
                        className={styles.modalCloseButton}
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.modalBody}>{children}</div>
            </div>
        </div>,
        document.body,
    )
}
