'use client';

import React, { useState, useRef, useCallback } from 'react';

interface CompressedImage {
  dataUrl: string;
  size: number;
  originalSize: number;
}

const ImageCompressor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback(async (file: File): Promise<CompressedImage> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  dataUrl: reader.result as string,
                  size: blob.size,
                  originalSize: file.size,
                });
              };
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('压缩图片失败'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('加载图片失败'));
      img.src = URL.createObjectURL(file);
    });
  }, [quality]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setIsCompressing(true);
    try {
      const originalDataUrl = URL.createObjectURL(file);
      setOriginalImage(originalDataUrl);
      const compressed = await compressImage(file);
      setCompressedImage(compressed);
    } catch (error) {
      console.error('压缩出错:', error);
      alert('压缩出错，请重试。');
    } finally {
      setIsCompressing(false);
    }
  }, [compressImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleQualityChange = useCallback(async (newQuality: number) => {
    setQuality(newQuality);
    if (originalImage && compressedImage) {
      const response = await fetch(originalImage);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setCompressedImage(compressed);
      } catch (error) {
        console.error('重新压缩出错:', error);
      } finally {
        setIsCompressing(false);
      }
    }
  }, [originalImage, compressedImage, compressImage]);

  const handleDownload = useCallback(() => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage.dataUrl;
      link.download = '压缩图片.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [compressedImage]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = compressedImage 
    ? ((compressedImage.originalSize - compressedImage.size) / compressedImage.originalSize * 100).toFixed(1)
    : '0';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">图片压缩</h1>
        <p className="text-gray-600">在尽量保证画质的前提下压缩图片体积</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="拖拽图片到此处或点击选择文件"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
        }}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragging ? '将图片拖拽到此处' : '将图片拖拽到此处'}
            </p>
            <p className="text-gray-500">或点击选择</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="选择图片文件"
        />
      </div>

      {/* Quality Slider */}
      {originalImage && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <label htmlFor="quality-slider" className="block text-sm font-medium text-gray-700 mb-2">
            压缩质量：{Math.round(quality * 100)}%
          </label>
          <input
            id="quality-slider"
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={quality}
            onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            aria-label="调整压缩质量"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>低质量 (10%)</span>
            <span>高质量 (100%)</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isCompressing && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">正在压缩图片...</span>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {originalImage && compressedImage && !isCompressing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">原始图片</h3>
            <div className="relative">
              <img src={originalImage} alt="原始图片" className="w-full h-auto rounded-lg" />
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">文件大小：</span> {formatFileSize(compressedImage.originalSize)}
              </p>
            </div>
          </div>

          {/* Compressed Image */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">压缩后图片</h3>
            <div className="relative">
              <img src={compressedImage.dataUrl} alt="压缩后图片" className="w-full h-auto rounded-lg" />
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">文件大小：</span> {formatFileSize(compressedImage.size)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">体积减少：</span> {compressionRatio}%
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">质量：</span> {Math.round(quality * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Download Button */}
      {compressedImage && !isCompressing && (
        <div className="text-center">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            aria-label="下载压缩后的图片"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            下载压缩后的图片
          </button>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb { appearance: none; height: 20px; width: 20px; border-radius: 50%; background: #3b82f6; cursor: pointer; }
        .slider::-moz-range-thumb { height: 20px; width: 20px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: none; }
      `}</style>
    </div>
  );
};

export default ImageCompressor;
