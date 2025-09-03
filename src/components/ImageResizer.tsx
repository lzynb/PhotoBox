'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizedImage {
  dataUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

const ImageResizer: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resizedImage, setResizedImage] = useState<ResizedImage | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = originalDimensions ? originalDimensions.width / originalDimensions.height : 1;

  useEffect(() => {
    if (maintainAspectRatio && width > 0 && originalDimensions) {
      const newHeight = Math.round(width / aspectRatio);
      setHeight(newHeight);
    }
  }, [width, maintainAspectRatio, aspectRatio, originalDimensions]);

  useEffect(() => {
    if (maintainAspectRatio && height > 0 && originalDimensions) {
      const newWidth = Math.round(height * aspectRatio);
      setWidth(newWidth);
    }
  }, [height, maintainAspectRatio, aspectRatio, originalDimensions]);

  const resizeImage = useCallback(async (file: File, targetWidth: number, targetHeight: number): Promise<ResizedImage> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }
        ctx?.drawImage(img, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve({ dataUrl, width: targetWidth, height: targetHeight, originalWidth: img.width, originalHeight: img.height });
      };

      img.onerror = () => reject(new Error('加载图片失败'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setIsResizing(true);
    try {
      const originalDataUrl = URL.createObjectURL(file);
      setOriginalImage(originalDataUrl);
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
        resizeImage(file, img.width, img.height).then((resized) => {
          setResizedImage(resized);
          setIsResizing(false);
        });
      };
      img.src = originalDataUrl;
    } catch (error) {
      console.error('处理图片出错:', error);
      alert('处理图片出错，请重试。');
      setIsResizing(false);
    }
  }, [resizeImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const files = Array.from(e.dataTransfer.files); if (files.length > 0) handleFileSelect(files[0]); }, [handleFileSelect]);
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }, [handleFileSelect]);

  const handleResize = useCallback(async () => {
    if (!originalImage || width <= 0 || height <= 0) return;
    setIsResizing(true);
    try {
      const response = await fetch(originalImage);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      const resized = await resizeImage(file, width, height);
      setResizedImage(resized);
    } catch (error) {
      console.error('调整尺寸出错:', error);
      alert('调整尺寸出错，请重试。');
    } finally {
      setIsResizing(false);
    }
  }, [originalImage, width, height, resizeImage]);

  const handleDownload = useCallback(() => {
    if (resizedImage) {
      const link = document.createElement('a');
      link.href = resizedImage.dataUrl;
      link.download = `调整后_${resizedImage.width}x${resizedImage.height}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [resizedImage]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">图片缩放</h1>
        <p className="text-gray-600">将图片调整到指定尺寸</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="拖拽图片到此处或点击选择文件"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">将图片拖拽到此处</p>
            <p className="text-gray-500">或点击选择</p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" aria-label="选择图片文件" />
      </div>

      {originalDimensions && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">缩放设置</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="width-input" className="block text-sm font-medium text-gray-700 mb-2">宽度 (px)</label>
              <input id="width-input" type="number" min="1" max="10000" value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={isResizing} />
            </div>
            <div>
              <label htmlFor="height-input" className="block text-sm font-medium text-gray-700 mb-2">高度 (px)</label>
              <input id="height-input" type="number" min="1" max="10000" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={isResizing} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">纵横比</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">{aspectRatio.toFixed(3)}:1</div>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input id="maintain-aspect-ratio" type="checkbox" checked={maintainAspectRatio} onChange={(e) => setMaintainAspectRatio(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" disabled={isResizing} />
            <label htmlFor="maintain-aspect-ratio" className="ml-2 block text-sm text-gray-900">保持纵横比</label>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">原始尺寸：{originalDimensions.width} × {originalDimensions.height} 像素</p>
          </div>

          <button onClick={handleResize} disabled={isResizing || width <= 0 || height <= 0} className="w-full md:w-auto inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isResizing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                正在调整...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                调整尺寸
              </>
            )}
          </button>
        </div>
      )}

      {originalImage && resizedImage && !isResizing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg白 rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">原始图片</h3>
            <div className="relative"><img src={originalImage} alt="原始图片" className="w-full h-auto rounded-lg" /></div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600"><span className="font-medium">原始尺寸：</span> {resizedImage.originalWidth} × {resizedImage.originalHeight}</p></div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">调整后图片</h3>
            <div className="relative"><img src={resizedImage.dataUrl} alt="调整后图片" className="w-full h-auto rounded-lg" /></div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm text-gray-600"><span className="font-medium">新尺寸：</span> {resizedImage.width} × {resizedImage.height}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">纵横比：</span> {(resizedImage.width / resizedImage.height).toFixed(3)}:1</p>
            </div>
          </div>
        </div>
      )}

      {resizedImage && !isResizing && (
        <div className="text-center">
          <button onClick={handleDownload} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors" aria-label="下载调整后图片">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            下载调整后图片
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageResizer;
