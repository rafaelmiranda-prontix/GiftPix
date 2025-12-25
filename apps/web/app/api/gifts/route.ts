import { NextResponse } from 'next/server';

const apiUrl = process.env.GIFTPIX_API_URL || 'http://localhost:3003/api';
const apiKey = process.env.GIFTPIX_API_KEY || process.env.API_SECRET_KEY;

export async function GET() {
  try {
    if (!apiKey) {
      return NextResponse.json({ success: false, error: { message: 'API key not configured' } }, { status: 500 });
    }

    const resp = await fetch(`${apiUrl}/gifts`, {
      headers: {
        'x-api-key': apiKey,
      },
      cache: 'no-store',
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('[api/gifts][GET] error', error);
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ success: false, error: { message: 'API key not configured' } }, { status: 500 });
    }

    const body = await request.json();
    console.info('[api/gifts] proxying create gift');
    const resp = await fetch(`${apiUrl}/gifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    console.info('[api/gifts] response', { status: resp.status });
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('[api/gifts] error', error);
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    );
  }
}
