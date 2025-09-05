module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  // 确保在生产环境中正确处理 CSS
  map: process.env.NODE_ENV === 'development' ? { inline: true } : false,
}
