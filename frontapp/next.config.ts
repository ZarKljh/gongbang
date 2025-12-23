import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // 1. 여기에 추가합니다.
    output: 'standalone',

    typescript: {
        ignoreBuildErrors: true,
    },

    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8090/api/:path*', // Spring Boot 서버
            },
        ]
    },
}

export default nextConfig
