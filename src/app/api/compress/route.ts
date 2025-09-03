import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get original image metadata
    const originalMetadata = await sharp(buffer).metadata();
    
    if (!originalMetadata.width || !originalMetadata.height) {
      return NextResponse.json(
        { error: 'Unable to read image dimensions' },
        { status: 400 }
      );
    }

    // Process image with Sharp
    let sharpInstance = sharp(buffer);

    // Resize if dimensions are specified
    if (maxWidth || maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Apply compression based on format
    let compressedBuffer: Buffer;
    let mimeType: string;

    switch (format) {
      case 'jpeg':
        compressedBuffer = await sharpInstance
          .jpeg({ quality: Math.round(quality * 100) })
          .toBuffer();
        mimeType = 'image/jpeg';
        break;
      
      case 'png':
        compressedBuffer = await sharpInstance
          .png({ quality: Math.round(quality * 100) })
          .toBuffer();
        mimeType = 'image/png';
        break;
      
      case 'webp':
        compressedBuffer = await sharpInstance
          .webp({ quality: Math.round(quality * 100) })
          .toBuffer();
        mimeType = 'image/webp';
        break;
      
      default:
        compressedBuffer = await sharpInstance
          .jpeg({ quality: Math.round(quality * 100) })
          .toBuffer();
        mimeType = 'image/jpeg';
    }

    // Get compressed image metadata
    const compressedMetadata = await sharp(compressedBuffer).metadata();

    // Calculate compression statistics
    const originalSize = file.size;
    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    // Return compressed image as buffer with metadata
    return new NextResponse(compressedBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': compressedBuffer.length.toString(),
        'X-Original-Size': originalSize.toString(),
        'X-Compressed-Size': compressedSize.toString(),
        'X-Compression-Ratio': compressionRatio,
        'X-Original-Width': originalMetadata.width.toString(),
        'X-Original-Height': originalMetadata.height.toString(),
        'X-Compressed-Width': (compressedMetadata.width || originalMetadata.width).toString(),
        'X-Compressed-Height': (compressedMetadata.height || originalMetadata.height).toString(),
        'X-Quality': quality.toString(),
        'X-Format': format,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Compression error:', error);
    
    // Handle specific Sharp errors
    if (error instanceof Error) {
      if (error.message.includes('Input buffer contains unsupported image format')) {
        return NextResponse.json(
          { error: 'Unsupported image format or corrupted image file' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('memory')) {
        return NextResponse.json(
          { error: 'Image too large to process. Please try a smaller image.' },
          { status: 413 }
        );
      }
    }

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
