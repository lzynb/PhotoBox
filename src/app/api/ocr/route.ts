import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

function runRapidOCR(payload: unknown): Promise<{ success: boolean; text?: string; error?: string }>{
	return new Promise((resolve) => {
		const py = spawn('python', ['scripts/ocr_rapidocr.py'], { stdio: ['pipe', 'pipe', 'pipe'] });

		let stdout = '';
		let stderr = '';

		py.stdout.on('data', (data) => {
			stdout += data.toString();
		});
		py.stderr.on('data', (data) => {
			stderr += data.toString();
		});
		py.on('error', (err) => {
			resolve({ success: false, error: `Failed to start Python: ${err.message}` });
		});
		py.on('close', () => {
			try {
				// Python prints a single JSON line
				const result = JSON.parse(stdout.trim());
				resolve(result);
			} catch (e) {
				resolve({ success: false, error: `Invalid Python output: ${stdout || stderr}` });
			}
		});

		py.stdin.write(JSON.stringify(payload));
		py.stdin.end();
	});
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
		if (!body || !body.image) {
			return NextResponse.json(
				{ success: false, error: 'No image data provided in JSON' },
				{ status: 400 }
			);
		}

		const result = await runRapidOCR(body);
		if (result.success) {
			return NextResponse.json({ success: true, text: result.text || '' });
		}
		return NextResponse.json({ success: false, error: result.error || 'OCR failed' }, { status: 500 });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
