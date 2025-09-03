import { NextRequest, NextResponse } from 'next/server';

interface CompressionParams {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const qualityParam = formData.get('quality') as string;
    const maxWidthParam = formData.get('maxWidth') as string;
    const maxHeightParam = formData.get('maxHeight') as string;
    const formatParam = formData.get('format') as string;

    // Validate file upload
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, and BMP are supported.' },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 20MB.' },
        { status: 400 }
      );
    }

    // Parse and validate quality parameter
    let quality: number;
    try {
      quality = parseFloat(qualityParam || '0.8');
      if (isNaN(quality) || quality < 0.1 || quality > 1.0) {
        return NextResponse.json(
          { error: 'Quality must be a number between 0.1 and 1.0' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid quality parameter' },
        { status: 400 }
      );
    }

    // Parse and validate maxWidth parameter
    let maxWidth: number | undefined;
    if (maxWidthParam) {
      try {
        maxWidth = parseInt(maxWidthParam);
        if (isNaN(maxWidth) || maxWidth <= 0 || maxWidth > 10000) {
          return NextResponse.json(
            { error: 'maxWidth must be a positive number between 1 and 10000' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid maxWidth parameter' },
          { status: 400 }
        );
      }
    }

    // Parse and validate maxHeight parameter
    let maxHeight: number | undefined;
    if (maxHeightParam) {
      try {
        maxHeight = parseInt(maxHeightParam);
        if (isNaN(maxHeight) || maxHeight <= 0 || maxHeight > 10000) {
          return NextResponse.json(
            { error: 'maxHeight must be a positive number between 1 and 10000' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid maxHeight parameter' },
          { status: 400 }
        );
      }
    }

    // Validate format parameter
    let format: 'jpeg' | 'png' | 'webp' = 'jpeg';
    if (formatParam) {
      if (!['jpeg', 'png', 'webp'].includes(formatParam)) {
        return NextResponse.json(
          { error: 'Format must be one of: jpeg, png, webp' },
          { status: 400 }
        );
      }
      format = formatParam as 'jpeg' | 'png' | 'webp';
    }

    // 由于云端（例如 Vercel）不提供 sharp，本接口在云端禁用，前端已使用 Canvas 在客户端完成压缩。
    // 返回元数据提示使用客户端压缩结果。
    const originalSize = file.size;
    return NextResponse.json(
      {
        success: false,
        message: 'Server compression is disabled in this deployment. Please use client-side compression.',
        originalSize,
        quality,
        maxWidth: maxWidth ?? null,
        maxHeight: maxHeight ?? null,
        format
      },
      { status: 501 }
    );

  } catch (error) {
    console.error('Compression error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error during image compression' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to compress images.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to compress images.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to compress images.' },
    { status: 405 }
  );
}
