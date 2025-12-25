import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';

export async function POST(request: Request) {
  try {
    if (!supabaseServer) {
      return NextResponse.json({ success: false, error: { message: 'Supabase não configurado' } }, { status: 500 });
    }

    const body = await request.json();
    const email = body?.email as string;
    const password = body?.password as string;

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: { message: 'E-mail e senha (mín 8) são obrigatórios' } },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Erro desconhecido' } },
      { status: 500 }
    );
  }
}
