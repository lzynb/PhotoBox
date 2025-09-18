/** @type {import('next').NextConfig} */
const nextConfig = {
  // 腾讯云静态网站托管：启用静态导出
  output: 'export',
  trailingSlash: true,
  // 环境变量配置
  env: {
    NEXT_PUBLIC_TENCENT_API_URL: process.env.NEXT_PUBLIC_TENCENT_API_URL || '',
  },
  images: {
    unoptimized: true,
    formats: ['image/webp'],
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['tesseract.js'],
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
  // 确保样式在生产环境中正确工作
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
