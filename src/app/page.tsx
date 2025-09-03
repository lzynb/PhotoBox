'use client';

import { useState } from 'react';
import ImageCompressor from '@/components/ImageCompressor';
import ImageResizer from '@/components/ImageResizer';
import ImageKeywordSearcher from '@/components/ImageKeywordSearcher';
import IDPhotoBackgroundChanger from '@/components/IDPhotoBackgroundChanger';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'intro' | 'compress' | 'resize' | 'search' | 'background'>('intro');

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">PhotoBox 工具集</h1>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('intro')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'intro'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                使用说明
              </button>
              <button
                onClick={() => setActiveTab('compress')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'compress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                图片压缩
              </button>
              <button
                onClick={() => setActiveTab('resize')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'resize'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                图片缩放
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                关键字检索
              </button>
              <button
                onClick={() => setActiveTab('background')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'background'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                证件照换底色
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-6">
        {activeTab === 'intro' && (
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎使用 PhotoBox 工具集</h2>
                <p className="text-gray-600">一个专注图片处理的轻量化工具集合。</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">是否免费</h3>
                <p className="text-gray-700">目前<span className="font-medium text-green-600">完全免费</span>使用。</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">功能介绍</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li><span className="font-medium">图片压缩</span>：在尽量保证画质的前提下降低图片体积，便于分享与上传。</li>
                  <li><span className="font-medium">图片缩放</span>：将图片调整到指定尺寸，支持保持纵横比。</li>
                  <li><span className="font-medium">关键字检索</span>：对图片进行文字识别（OCR），并按输入关键词筛选匹配的图片。</li>
                  <li><span className="font-medium">证件照换底色</span>：本地AI抠图，快速将背景替换为白/红/蓝等纯色。</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">图片数据安全</h3>
                <p className="text-gray-700">数据处理尽可能在本地完成（如证件照换底色使用本地 AI 模型），不主动上传到第三方服务器。仅当你主动与他人分享处理结果时，数据才会离开你的设备。</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">联系作者</h3>
                <div className="text-gray-700">
                  <p>邮箱：<a href="mailto:luzhiyang2024@163.com" className="text-blue-600 hover:underline">luzhiyang2024@163.com</a></p>
                  <p>微信：<span className="font-mono">ZY_L0215</span></p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('compress')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  立即开始使用
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'compress' && <ImageCompressor />}
        {activeTab === 'resize' && <ImageResizer />}
        {activeTab === 'search' && <ImageKeywordSearcher />}
        {activeTab === 'background' && <IDPhotoBackgroundChanger />}
      </div>
    </main>
  );
}
