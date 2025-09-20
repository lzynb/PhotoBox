'use client';

import React, { useState, useRef, useCallback } from 'react';

interface BackgroundColor {
  name: string;
  value: string;
  preview: string;
}

const predefinedColors: BackgroundColor[] = [
  { name: '白色', value: '#FFFFFF', preview: '#FFFFFF' },
  { name: '红色', value: '#FF0000', preview: '#FF0000' },
  { name: '蓝色', value: '#0066CC', preview: '#0066CC' },
  { name: '绿色', value: '#008000', preview: '#008000' },
  { name: '灰色', value: '#808080', preview: '#808080' },
  { name: '黄色', value: '#FFD700', preview: '#FFD700' },
];

const IDPhotoBackgroundChanger: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [transparentImage, setTransparentImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF');
  const [customColor, setCustomColor] = useState<string>('#FFFFFF');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: compress image to data URL (JPEG)
  const fileToCompressedDataURL = useCallback(async (file: File, maxWidth = 1600, quality = 0.85): Promise<string> => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('加载图片失败'));
    });

    const scale = Math.min(1, maxWidth / img.width);
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('当前环境不支持 Canvas');
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    URL.revokeObjectURL(img.src);
    return dataUrl;
  }, []);

  // Robust DataURL/blob URL to File
  const dataURLtoFile = async (input: string, filename: string): Promise<File> => {
    try {
      if (input.startsWith('data:')) {
        const arr = input.split(',');
        const mimeMatch = arr[0].match(/data:(.*?);base64/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(arr[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
        const blob = new Blob([u8arr], { type: mime });
        return new File([blob], filename, { type: mime });
      }
      // blob: or http(s):
      const response = await fetch(input, { cache: 'no-store' });
      if (!response.ok) throw new Error('获取图片数据失败');
      const blob = await response.blob();
      const type = blob.type || 'image/jpeg';
      return new File([blob], filename, { type });
    } catch (e) {
      throw new Error('转换为文件失败');
    }
  };

  // Remove background using local rembg API (pass color explicitly)
  const removeBackground = useCallback(async (imageFile: File, colorHex: string): Promise<string> => {
    const base64 = await fileToCompressedDataURL(imageFile);

    // 检查是否有腾讯云 API 网关地址
    const tencentApiUrl = process.env.NEXT_PUBLIC_TENCENT_API_URL || 'https://1300931050-hb0xxy3l23.ap-guangzhou.tencentscf.com';
    const apiUrl = tencentApiUrl ? `${tencentApiUrl}/remove-background` : '/api/remove-background';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64,
        newBgColor: colorHex
      }),
    });

    if (!response.ok) {
      let errorMessage = '移除背景失败';
      if (response.status === 400) errorMessage = '请求无效，请检查图片与颜色选择。';
      else if (response.status === 413) errorMessage = '图片过大，请使用更小的图片。';
      else if (response.status === 500) {
        const errorData = await response.json().catch(() => ({} as any));
        errorMessage = (errorData as any).error || '背景移除处理失败。';
      }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('转换图片为数据URL失败'));
      };
      reader.onerror = () => reject(new Error('读取图片数据失败'));
      reader.readAsDataURL(blob);
    });
  }, [fileToCompressedDataURL]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('文件大小需小于 20MB');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessedImage(null);

    try {
      const originalDataUrl = URL.createObjectURL(file);
      setOriginalImage(originalDataUrl);
      setOriginalFile(file);

      const finalImageUrl = await removeBackground(file, selectedColor);
      setProcessedImage(finalImageUrl);
      setTransparentImage(finalImageUrl);
    } catch (error) {
      console.error('处理图片出错:', error);
      setError(error instanceof Error ? error.message : '处理图片时发生错误');
    } finally {
      setIsProcessing(false);
    }
  }, [removeBackground, selectedColor]);

  // Handle color change
  const handleColorChange = useCallback(async (newColor: string) => {
    setSelectedColor(newColor);
    if (originalImage) {
      setIsProcessing(true);
      setError(null);
      try {
        if (originalFile) {
          const finalImageUrl = await removeBackground(originalFile, newColor);
          setProcessedImage(finalImageUrl);
        } else {
          const file = await dataURLtoFile(originalImage, 'image.jpg');
          const finalImageUrl = await removeBackground(file, newColor);
          setProcessedImage(finalImageUrl);
        }
      } catch (error) {
        console.error('更新背景颜色出错:', error);
        setError(error instanceof Error ? error.message : '更新背景颜色失败');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setError('暂无原始图片，请先上传图片。');
    }
  }, [originalImage, originalFile, removeBackground]);

  // Handle drag and drop
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

  const handleDownload = useCallback(() => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = '证件照换底色.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [processedImage]);

  React.useEffect(() => {
    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage);
      if (processedImage && processedImage.startsWith('blob:')) {
        URL.revokeObjectURL(processedImage);
      }
    };
  }, [originalImage, transparentImage, processedImage]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">证件照换底色</h1>
        <p className="text-gray-600">移除背景并替换为你选择的纯色背景</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="拖拽图片到此处或点击选择文件"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
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
            <p className="text-gray-500">或点击选择（最大 20MB）</p>
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

      {/* Background Color Selection */}
      {originalImage && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">背景颜色</h3>
          
          {/* Predefined Colors */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
            {predefinedColors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedColor === color.value
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full h-8 rounded mb-1" style={{ backgroundColor: color.preview }}></div>
                <span className="text-xs text-gray-700">{color.name}</span>
              </button>
            ))}
          </div>

          {/* Custom Color Picker */}
          <div className="flex items-center space-x-3">
            <label htmlFor="custom-color" className="text-sm font-medium text-gray-700">自定义颜色：</label>
            <input
              id="custom-color"
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                handleColorChange(e.target.value);
              }}
              className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                handleColorChange(e.target.value);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">错误</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">正在处理图片...</span>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {originalImage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">原始图片</h3>
            <div className="relative"><img src={originalImage} alt="原始照片" className="w-full h-auto rounded-lg" /></div>
          </div>

          {/* Processed Image */}
          {processedImage ? (
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">处理后的图片</h3>
              <div className="relative"><img src={processedImage} alt="换底后的照片" className="w-full h-auto rounded-lg" /></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">处理后的图片</h3>
              <div className="relative h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                {isProcessing ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">正在处理图片...</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>处理后的图片会显示在这里</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Download Button */}
      {processedImage && !isProcessing && (
        <div className="text-center">
          <button onClick={handleDownload} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors" aria-label="下载处理后的图片">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            下载处理后的图片
          </button>
        </div>
      )}
    </div>
  );
};

export default IDPhotoBackgroundChanger;
