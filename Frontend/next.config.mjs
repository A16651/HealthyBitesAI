/** @type {import('next').NextConfig} */
const nextConfig = {
    // Image optimization for external sources
    images: {
        domains: ['world.openfoodfacts.org', 'images.openfoodfacts.org'],
        unoptimized: true,
    },

    // Ensure compatibility across platforms
    reactStrictMode: true,

    // Enable SWC minification for better performance
    swcMinify: true,

    // Allow dev origins for cross-origin requests during development
    allowedDevOrigins: ['http://localhost:3000'],

    // Enable standalone output for production deployment
    output: 'standalone',

    // 🔥 PROXY: Forward API requests to FastAPI backend
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/api/:path*',
            },
        ];
    },
};

export default nextConfig;
