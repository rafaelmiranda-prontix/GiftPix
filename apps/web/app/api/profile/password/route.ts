import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';

const getUserFromAuth = async (authorization?: string) => {
  if (!supabaseServer || !authorization) return null;
  const token = authorization.replace('Bearer ', '');
  const { data } = await supabaseServer.auth.getUser(token);
  return data.user ?? null;
};

export async function PUT(request: Request) {
  try {
    if (!supabaseServer) {
      return NextResponse.json({ success: false, error: { message: 'Supabase não configurado' } }, { status: 500 });
    }
    const authHeader = request.headers.get('authorization') || undefined;
    const user = await getUserFromAuth(authHeader);
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Não autenticado' } }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = body?.current_password as string | undefined;
    const newPassword = body?.new_password as string | undefined;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: { message: 'Nova senha deve ter pelo menos 8 caracteres' } },
        { status: 400 }
      );
    }

    // Opcional: validação do password atual
    if (currentPassword && user.email) {
      const res = await supabaseServer.auth.signInWithPassword({ email: user.email, password: currentPassword });
      if (res.error) {
        return NextResponse.json({ success: false, error: { message: 'Senha atual inválida' } }, { status: 400 });
      }
    }

    const { error } = await supabaseServer.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
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
