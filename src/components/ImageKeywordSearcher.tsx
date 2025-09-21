'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';

interface ProcessedImage {
  id: string;
  file: File;
  dataUrl: string;
  extractedText: string;
  isProcessing: boolean;
  progress: number;
  error?: string;
}

interface FilteredImage extends ProcessedImage {
  matches: boolean;
}

const ImageKeywordSearcher: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [keywords, setKeywords] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'contains' | 'not_contains'>('contains');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [processingCancelled, setProcessingCancelled] = useState<boolean>(false);
  const [ocrReady, setOcrReady] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedKeywords = useMemo(() => {
    return keywords
      .split(/[,，]/)
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .map(k => k.toLowerCase());
  }, [keywords]);

  const filteredImages = useMemo(() => {
    if (parsedKeywords.length === 0) {
      return images.filter(img => !img.error).map(img => ({ ...img, matches: true }));
    }
    return images
      .filter(img => !img.error)
      .map(img => {
        const textLower = img.extractedText.toLowerCase();
        const containsAnyKeyword = parsedKeywords.some(keyword => textLower.includes(keyword.toLowerCase()));
        const matches = filterMode === 'contains' ? containsAnyKeyword : !containsAnyKeyword;
        return { ...img, matches };
      })
      .filter(img => img.matches);
  }, [images, parsedKeywords, filterMode]);

  const uploadForOCR = useCallback(async (image: ProcessedImage): Promise<ProcessedImage> => {
    try {
      // 转 base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image.file);
      });

      setImages(prev => prev.map(img => img.id === image.id ? { ...img, progress: 25, isProcessing: true, error: undefined } : img));

      // 检查是否有腾讯云 API 网关地址
      const tencentApiUrl = process.env.NEXT_PUBLIC_TENCENT_API_URL || 'https://1300931050-izxeco6na5.ap-guangzhou.tencentscf.com';
      const apiUrl = tencentApiUrl ? `${tencentApiUrl}/ocr` : '/api/ocr';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, filename: image.file.name }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      if (result.success) {
        setImages(prev => prev.map(img => img.id === image.id ? { ...img, progress: 100, isProcessing: false, extractedText: result.text } : img));
        return { ...image, extractedText: result.text, isProcessing: false, progress: 100 };
      } else {
        throw new Error(result.error || 'OCR 处理失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提取文本失败';
      setImages(prev => prev.map(img => img.id === image.id ? { ...img, isProcessing: false, error: errorMessage } : img));
      return { ...image, isProcessing: false, error: errorMessage };
    }
  }, []);

  const processImage = useCallback(async (image: ProcessedImage): Promise<ProcessedImage> => {
    try {
      setImages(prev => prev.map(img => img.id === image.id ? { ...img, progress: 10, isProcessing: true, error: undefined } : img));
      const result = await uploadForOCR(image);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提取文本失败';
      setImages(prev => prev.map(img => img.id === image.id ? { ...img, isProcessing: false, error: errorMessage } : img));
      return { ...image, isProcessing: false, error: errorMessage };
    }
  }, [uploadForOCR]);

  const processAllImages = useCallback(async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProcessingCancelled(false);
    try {
      for (let i = 0; i < images.length; i++) {
        if (processingCancelled) break;
        const image = images[i];
        if (!image.extractedText && !image.error) {
          try { await processImage(image); } catch {}
          if (i < images.length - 1) await new Promise(r => setTimeout(r, 500));
        }
      }
    } finally {
      setIsProcessing(false);
      setProcessingCancelled(false);
    }
  }, [images, processImage, processingCancelled]);

  const cancelProcessing = useCallback(() => { setProcessingCancelled(true); setIsProcessing(false); }, []);

  const handleFileSelect = useCallback((files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) { alert('请选择图片文件'); return; }
    if (images.length + imageFiles.length > 100) { alert('最多上传 100 张图片'); return; }
    const newImages: ProcessedImage[] = imageFiles.map((file, index) => ({ id: `${Date.now()}-${index}`, file, dataUrl: URL.createObjectURL(file), extractedText: '', isProcessing: false, progress: 0 }));
    setImages(prev => [...prev, ...newImages]);
  }, [images.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }, [handleFileSelect]);
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const files = e.target.files; if (files) handleFileSelect(files); }, [handleFileSelect]);

  const removeImage = useCallback((id: string) => { setImages(prev => { const image = prev.find(img => img.id === id); if (image) URL.revokeObjectURL(image.dataUrl); return prev.filter(img => img.id !== id); }); }, []);
  const clearAllImages = useCallback(() => { images.forEach(img => URL.revokeObjectURL(img.dataUrl)); setImages([]); }, [images]);

  const downloadImage = useCallback((image: FilteredImage) => { const link = document.createElement('a'); link.href = image.dataUrl; link.download = `筛选_${image.file.name}`; document.body.appendChild(link); link.click(); document.body.removeChild(link); }, []);
  const downloadAllMatching = useCallback(() => { if (filteredImages.length === 0) { alert('没有可下载的匹配图片'); return; } filteredImages.forEach((image, index) => { setTimeout(() => { downloadImage(image); }, index * 100); }); }, [filteredImages, downloadImage]);

  const processedCount = images.filter(img => img.extractedText || img.error).length;
  const totalCount = images.length;
  const matchingCount = filteredImages.length;
  const errorCount = images.filter(img => img.error).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">图片关键字检索</h1>
        <p className="text-gray-600">上传图片并在识别文本中按关键字筛选</p>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-700">OCR 引擎状态：就绪</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">使用服务端 OCR 进行文本识别</p>
      </div>

      <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} role="button" tabIndex={0} aria-label="拖拽图片到此处或点击选择文件" onClick={() => fileInputRef.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}>
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">将图片拖拽到此处</p>
            <p className="text-gray-500">或点击选择（最多 100 张）</p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileInputChange} className="hidden" aria-label="选择图片文件" />
      </div>

      {images.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">已上传 {images.length} 张</span>
              {totalCount > 0 && (
                <span className="text-sm text-gray-600">已处理 {processedCount}/{totalCount} {isProcessing && processedCount > 0 && (<span className="text-blue-600 ml-1">(处理中...)</span>)}
                </span>
              )}
              {errorCount > 0 && (<span className="text-sm text-red-600">{errorCount} 个错误</span>)}
              {parsedKeywords.length > 0 && (<span className="text-sm text-green-600 font-medium">匹配 {matchingCount} 张</span>)}
            </div>
            <div className="flex space-x-2">
              <button onClick={clearAllImages} className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-md transition-colors">清空</button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {processedCount < totalCount && (
              <button onClick={processAllImages} disabled={isProcessing} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isProcessing ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>处理中...</>) : ('开始OCR识别')}
              </button>
            )}
            {errorCount > 0 && !isProcessing && (
              <button onClick={() => { setImages(prev => prev.map(img => img.error ? { ...img, error: undefined, extractedText: '', isProcessing: false, progress: 0 } : img)); setTimeout(() => processAllImages(), 100); }} className="px-4 py-2 text-sm bg-orange-600 text白 rounded hover:bg-orange-700 transition-colors">
                重试失败项 ({errorCount})
              </button>
            )}
            {isProcessing && (<button onClick={cancelProcessing} className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-md transition-colors">取消</button>)}
          </div>
        </div>
      )}

      {processedCount > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">检索设置</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="keywords-input" className="block text-sm font-medium text-gray-700 mb-2">关键词（用逗号分隔）</label>
              <input id="keywords-input" type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="输入关键词，多个用逗号分隔" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <p className="text-xs text-gray-500 mt-1">{parsedKeywords.length > 0 ? `当前检索：${parsedKeywords.join(', ')}` : '输入关键词以筛选图片'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">筛选模式</label>
              <div className="space-y-2">
                <label className="flex items-center"><input type="radio" value="contains" checked={filterMode === 'contains'} onChange={(e) => setFilterMode(e.target.value as 'contains' | 'not_contains')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" /><span className="ml-2 text-sm text-gray-900">包含关键词</span></label>
                <label className="flex items-center"><input type="radio" value="not_contains" checked={filterMode === 'not_contains'} onChange={(e) => setFilterMode(e.target.value as 'contains' | 'not_contains')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" /><span className="ml-2 text-sm text-gray-900">不包含关键词</span></label>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">处理进度</h3>
          <div className="space-y-3">
            {images.map(image => (
              <div key={image.id} className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100"><img src={image.dataUrl} alt="缩略图" className="w-full h-full object-cover" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{image.file.name}</span>
                    <span className="text-sm text-gray-500">{image.isProcessing ? (<span>{image.progress < 50 ? '上传中...' : 'OCR处理中...'}</span>) : image.error ? '错误' : '完成'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${image.progress}%` }}></div></div>
                  {image.error && (<p className="text-xs text-red-600 mt-1">{image.error}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {processedCount > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">检索结果</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{parsedKeywords.length > 0 ? `匹配 ${matchingCount} 张` : `${images.filter(img => !img.error).length} 张已处理`}</span>
              {matchingCount > 0 && (<button onClick={downloadAllMatching} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">全部下载 ({matchingCount})</button>)}
            </div>
          </div>
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              {parsedKeywords.length > 0 ? (
                <div><p className="text-gray-500 text-lg mb-2">无匹配结果</p><p className="text-gray-400 text-sm">尝试其他关键词或检查筛选模式</p></div>
              ) : (
                <div><p className="text-gray-500 text-lg mb-2">暂无可展示的图片</p><p className="text-gray-400 text-sm">部分图片可能处理失败</p></div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredImages.map(image => (
                <div key={image.id} className="relative group rounded-lg overflow-hidden border-2 border-green-300 bg-green-50">
                  <div className="aspect-square relative">
                    <img src={image.dataUrl} alt={image.file.name} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(image.id)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs">×</button>
                    <button onClick={() => downloadImage(image)} className="absolute top-2 left-2 w-6 h-6 bg-green-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs" title="下载">↓</button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate mb-1">{image.file.name}</p>
                    {image.extractedText && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-700">查看识别文本</summary>
                        <div className="mt-1 p-2 bg白 rounded border text-xs text-gray-700 max-h-20 overflow-y-auto">{image.extractedText || '无识别文本'}</div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageKeywordSearcher;
