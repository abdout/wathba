/** @type {import('next').NextConfig} */

// Security headers configuration
const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
    },
    {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
    },
    {
        key: 'Content-Security-Policy',
        value: process.env.NODE_ENV === 'production'
            ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.accounts.dev https://*.clerk.accounts.dev https://js.stripe.com https://checkout.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://ik.imagekit.io https://img.clerk.com https://*.stripe.com; connect-src 'self' https://clerk.accounts.dev https://*.clerk.accounts.dev https://api.stripe.com https://checkout.stripe.com wss://*.pusher.com https://*.pusher.com; frame-src 'self' https://checkout.stripe.com https://js.stripe.com https://hooks.stripe.com; object-src 'none';"
            : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https: wss:;"
    }
];

const nextConfig = {
    // Optimize for production
    poweredByHeader: false,
    compress: true,
    productionBrowserSourceMaps: false,

    // Enable experimental features for performance
    experimental: {
        optimizeCss: true,
        scrollRestoration: true,
    },

    typescript: {
        // Ignore TypeScript errors since this is primarily a JS project
        ignoreBuildErrors: true,
    },
    eslint: {
        // Enable ESLint checks during builds
        ignoreDuringBuilds: false,
    },
    images:{
        unoptimized: true,
        domains: ['ik.imagekit.io'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
                pathname: '/**',
            }
        ],
        // Add image optimization settings
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    env: {
        // Fallback values for build time when .env.local is not present
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2hhcm1pbmctcmVkYmlyZC02LmNsZXJrLmFjY291bnRzLmRldiQ',
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_test_q6l6MdnOymV51kNPeWzrzYvJItKT48DH9Cf2OdkBaI',
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
        NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/',
        NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/',
        NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || '/onboarding',
    },

    // Headers configuration
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'no-store, max-age=0' }
                ]
            }
        ];
    },

    // Redirects for common security issues
    async redirects() {
        return [
            {
                source: '/.env',
                destination: '/404',
                permanent: false,
            },
            {
                source: '/.env.local',
                destination: '/404',
                permanent: false,
            },
            {
                source: '/.git/:path*',
                destination: '/404',
                permanent: false,
            }
        ];
    },

    // Webpack optimization
    webpack: (config, { isServer }) => {
        // Optimize bundle size
        if (!isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    vendor: {
                        name: 'vendor',
                        chunks: 'all',
                        test: /node_modules/,
                        priority: 20
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'all',
                        priority: 10,
                        reuseExistingChunk: true,
                        enforce: true
                    }
                }
            };
        }

        return config;
    }
};

export default nextConfig;
