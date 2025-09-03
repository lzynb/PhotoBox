import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RemoveBackgroundRequest {
  image: string; // Base64 encoded image
  newBgColor: string; // Hex color code
}

function runRembgPython(payload: RemoveBackgroundRequest, timeoutMs = 120000): Promise<{ success: boolean; tempFilePath?: string; error?: string }> {
  return new Promise((resolve) => {
    const py = spawn('python', ['scripts/remove_background.py'], { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';
    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        try { py.kill('SIGKILL'); } catch {}
        resolve({ success: false, error: 'Python processing timed out' });
      }
    }, timeoutMs);

    py.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    py.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    py.on('error', (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      resolve({ success: false, error: `Failed to start Python: ${err.message}` });
    });
    
    py.on('close', (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          if (result.success && result.tempFilePath) {
            resolve({ success: true, tempFilePath: result.tempFilePath });
          } else {
            resolve({ success: false, error: result.error || 'Python processing failed' });
          }
        } catch (e) {
          resolve({ success: false, error: `Invalid Python output: ${stdout || stderr}` });
        }
      } else {
        resolve({ success: false, error: `Python process failed with code ${code}: ${stderr}` });
      }
    });

    try {
      py.stdin.write(JSON.stringify(payload));
      py.stdin.end();
    } catch (e: any) {
      clearTimeout(timeout);
      resolve({ success: false, error: `Failed to send data to Python: ${e?.message || e}` });
    }
  });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    if (!body || !body.image || !body.newBgColor) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: image and newBgColor' },
        { status: 400 }
      );
    }

    // Accept #RGB or #RRGGBB
    const colorRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
    if (typeof body.newBgColor !== 'string' || !colorRegex.test(body.newBgColor)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color format. Use hex like #FFF or #FFFFFF' },
        { status: 400 }
      );
    }

    const result = await runRembgPython({
      image: body.image,
      newBgColor: body.newBgColor
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Background removal failed' },
        { status: 500 }
      );
    }

    try {
      const fs = await import('fs/promises');
      const imageBuffer = await fs.readFile(result.tempFilePath!);
      const response = new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="processed-image.png"',
          'Cache-Control': 'no-cache',
        },
      });

      try {
        await fs.unlink(result.tempFilePath!);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }

      return response;

    } catch (readError) {
      console.error('Failed to read processed image:', readError);
      return NextResponse.json(
        { success: false, error: 'Failed to read processed image' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
