/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    logging: {
        fetches: {
            fullUrl: true
        }
    },
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };
        return config;
    },
    compiler: {
        emotion: true,
    },
    env: {
        IMGBB_IMAGES_API_KEY: process.env.IMGBB_IMAGES_API_KEY,
    },
    experimental: {
        outputFileTracingRoot: undefined,
    },
};

module.exports = nextConfig; 