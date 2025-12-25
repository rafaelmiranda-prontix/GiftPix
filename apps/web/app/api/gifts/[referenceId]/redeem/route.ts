import { NextResponse } from 'next/server';

const apiUrl = process.env.GIFTPIX_API_URL || 'http://localhost:3003/api';
const apiKey = process.env.GIFTPIX_API_KEY || process.env.API_SECRET_KEY;

export async function POST(request: Request, { params }: { params: { referenceId: string } }) {
  try {
    if (!apiKey) {
      return NextResponse.json({ success: false, error: { message: 'API key not configured' } }, { status: 500 });
    }

    const body = await request.json();
    console.info('[api/gifts/:referenceId/redeem] proxying redeem', { referenceId: params.referenceId });
    const resp = await fetch(`${apiUrl}/gifts/${params.referenceId}/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    console.info('[api/gifts/:referenceId/redeem] response', { status: resp.status });
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('[api/gifts/:referenceId/redeem] error', error);
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    );
  }
}
