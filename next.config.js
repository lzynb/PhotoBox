/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['tesseract.js'],
  },
  images: {
    formats: ['image/webp'],
  },
  swcMinify: true,
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
    
    // 配置 Tesseract.js worker 处理
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { 
        loader: 'worker-loader',
        options: {
          inline: true,
        }
      },
    });
    
    return config;
  },
  // 添加额外的兼容性配置
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
