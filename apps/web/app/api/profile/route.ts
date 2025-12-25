import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';

const getUserFromAuth = async (authorization?: string) => {
  if (!supabaseServer || !authorization) return null;
  const token = authorization.replace('Bearer ', '');
  const { data } = await supabaseServer.auth.getUser(token);
  return data.user ?? null;
};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;
    const user = await getUserFromAuth(authHeader);
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Não autenticado' } }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        email_verified: Boolean(user.email_confirmed_at),
        notifications_email: user.user_metadata?.notifications_email !== false,
        deleted_at: user.user_metadata?.deleted_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Erro desconhecido' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;
    const user = await getUserFromAuth(authHeader);
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Não autenticado' } }, { status: 401 });
    }
    if (!supabaseServer) {
      return NextResponse.json({ success: false, error: { message: 'Supabase não configurado' } }, { status: 500 });
    }

    const body = await request.json();
    const notifications = body?.notifications_email !== false;
    const name = user.user_metadata?.name;

    const { error } = await supabaseServer.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        notifications_email: notifications,
        name,
      },
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

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;
    const user = await getUserFromAuth(authHeader);
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Não autenticado' } }, { status: 401 });
    }
    if (!supabaseServer) {
      return NextResponse.json({ success: false, error: { message: 'Supabase não configurado' } }, { status: 500 });
    }

    const deleted_at = new Date().toISOString();
    const { error } = await supabaseServer.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        deleted_at,
        notifications_email: false,
      },
    });
    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: { deleted_at } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Erro desconhecido' } },
      { status: 500 }
    );
  }
}
