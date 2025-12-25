import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: { message: 'Supabase admin key not configured' } }, { status: 500 });
    }

    const body = await request.json();
    const email = body?.email as string;
    if (!email) {
      return NextResponse.json({ success: false, error: { message: 'E-mail é obrigatório' } }, { status: 400 });
    }

    const redirectTo =
      body?.redirectTo ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`;

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Erro desconhecido' } },
      { status: 500 }
    );
  }
}
