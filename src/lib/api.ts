export interface CompressionOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressionResult {
  dataUrl: string;
  size: number;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number;
  compressedHeight: number;
  compressionRatio: string;
  quality: number;
  format: string;
}

export async function compressImageAPI(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', options.quality.toString());
  
  if (options.maxWidth) {
    formData.append('maxWidth', options.maxWidth.toString());
  }
  
  if (options.maxHeight) {
    formData.append('maxHeight', options.maxHeight.toString());
  }
  
  if (options.format) {
    formData.append('format', options.format);
  }

  const response = await fetch('/api/compress', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  return {
    dataUrl,
    size: blob.size,
    originalSize: parseInt(response.headers.get('X-Original-Size') || '0'),
    originalWidth: parseInt(response.headers.get('X-Original-Width') || '0'),
    originalHeight: parseInt(response.headers.get('X-Original-Height') || '0'),
    compressedWidth: parseInt(response.headers.get('X-Compressed-Width') || '0'),
    compressedHeight: parseInt(response.headers.get('X-Compressed-Height') || '0'),
    compressionRatio: response.headers.get('X-Compression-Ratio') || '0',
    quality: parseFloat(response.headers.get('X-Quality') || '0'),
    format: response.headers.get('X-Format') || 'jpeg',
  };
}
