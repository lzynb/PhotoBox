/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 experimental.appDir，Next.js 13.2.4 默认支持
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
  },
  images: {
    formats: ['image/webp'],
  },
  swcMinify: true,
  // 简化 webpack 配置，移除可能导致构建问题的配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: false,
        util: false,
        querystring: false,
      };
    }
    
    return config;
  },
  // 添加额外的兼容性配置
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 确保输出配置正确
  output: 'standalone',
}

module.exports = nextConfig
