import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
