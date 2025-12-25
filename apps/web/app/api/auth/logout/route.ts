import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';

export async function POST() {
  try {
    if (!supabaseServer) {
      return NextResponse.json({ success: false, error: { message: 'Supabase não configurado' } }, { status: 500 });
    }

    const { error } = await supabaseServer.auth.signOut();
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
