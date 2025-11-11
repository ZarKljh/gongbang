'use client'

import { useEffect, useRef } from 'react'
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

export default function Modal({ open, onClose, title, children, size = 'md', closeOnBackdrop = true }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!open) return

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKey)

        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = prev
        }
    }, [open, onClose])

    if (!open) return null

    const sizeClass = size === 'sm' ? styles.modalSm : size === 'lg' ? styles.modalLg : styles.modalMd

    return createPortal(
        <div className={styles.modalRoot}>
            {/* 어두운 배경 */}
            <div className={styles.modalBackdrop} onClick={() => closeOnBackdrop && onClose()} />

            {/* 모달 박스 */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                className={`${styles.modalDialog} ${sizeClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h2 id="modal-title" className={styles.modalTitle}>
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
