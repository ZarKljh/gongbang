import { useEffect } from 'react'

interface Options {
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export default function useInfiniteScroll({ loading, hasMore, onLoadMore }: Options) {
  useEffect(() => {
    if (!hasMore || loading) return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const viewportHeight = window.innerHeight
      const fullHeight = document.documentElement.scrollHeight

      // 바닥 근처로 왔는지 체크
      if (scrollTop + viewportHeight >= fullHeight - 50) {
        onLoadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchmove', handleScroll) // 모바일 대응

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
    }
  }, [loading, hasMore])
}