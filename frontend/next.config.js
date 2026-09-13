/** @type {import('next').NextConfig} */
const isExport = process.env.OUTPUT_MODE === 'export';

const nextConfig = {
  ...(isExport ? { output: 'export' } : {}),
  ...(!isExport
    ? {
        headers: async () => [
          {
            source: '/sw.js',
            headers: [
              { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
              { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
            ],
          },
        ],
      }
    : {}),
  webpack(config) {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

module.exports = nextConfig;

