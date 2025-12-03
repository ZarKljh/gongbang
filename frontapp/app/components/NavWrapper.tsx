// app/components/NavWrapper.tsx
'use client'

import { usePathname } from 'next/navigation'
import MainNav from '@/app/components/MainNav'

export default function NavWrapper() {
    const pathname = usePathname()

    // /admin 아래에서는 메인 네비게이션 숨김
    if (pathname.startsWith('/admin')) {
        return null
    }

    return <MainNav />
}
