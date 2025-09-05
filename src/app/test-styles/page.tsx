export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">样式测试页面</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">基础样式测试</h2>
            <p className="text-gray-600 mb-4">这是一个测试段落，用于验证 Tailwind CSS 样式是否正确加载。</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              测试按钮
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">颜色测试</h2>
            <div className="space-y-2">
              <div className="w-full h-8 bg-red-500 rounded"></div>
              <div className="w-full h-8 bg-green-500 rounded"></div>
              <div className="w-full h-8 bg-blue-500 rounded"></div>
              <div className="w-full h-8 bg-yellow-500 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">响应式测试</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 p-4 rounded text-center">
                项目 {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
