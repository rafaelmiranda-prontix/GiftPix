/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { Button, Card } from '@giftpix/ui';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Profile = {
  id: string;
  email: string;
  name?: string;
  email_verified: boolean;
  notifications_email: boolean;
  deleted_at?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifPref, setNotifPref] = useState(true);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token || null;
      setSessionToken(token);
      if (!token) {
        router.push('/#login');
      }
    });
  }, [router]);

  const fetchProfile = async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok || data.success !== true) {
        throw new Error(data?.error?.message || 'Falha ao carregar perfil');
      }
      setProfile(data.data);
      setNotifPref(data.data.notifications_email !== false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionToken) {
      fetchProfile(sessionToken);
    }
  }, [sessionToken]);

  const savePreferences = async () => {
    if (!sessionToken) return;
    setIsSavingPrefs(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const resp = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ notifications_email: notifPref }),
      });
      const data = await resp.json();
      if (!resp.ok || data.success !== true) {
        throw new Error(data?.error?.message || 'Erro ao salvar preferências');
      }
      setSuccessMsg('Preferências salvas.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const changePassword = async () => {
    if (!sessionToken) return;
    if (!pwdNew || pwdNew.length < 8 || pwdNew !== pwdConfirm) {
      setError('Senha deve ter 8+ caracteres e coincidir na confirmação.');
      return;
    }
    setIsChangingPwd(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const resp = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ current_password: pwdCurrent, new_password: pwdNew }),
      });
      const data = await resp.json();
      if (!resp.ok || data.success !== true) {
        throw new Error(data?.error?.message || 'Erro ao alterar senha');
      }
      setSuccessMsg('Senha alterada. Faça login novamente.');
      await supabase.auth.signOut();
      router.push('/#login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsChangingPwd(false);
    }
  };

  const deleteAccount = async () => {
    if (!sessionToken) return;
    setIsDeleting(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const resp = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await resp.json();
      if (!resp.ok || data.success !== true) {
        throw new Error(data?.error?.message || 'Erro ao excluir conta');
      }
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10 text-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Perfil</p>
          <h1 className="text-3xl font-bold">Seu perfil GiftPix</h1>
          <p className="text-slate-100">Dados de conta, segurança e preferências de notificação.</p>
        </div>
        <Link href="/dashboard">
          <Button intent="secondary">Voltar</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300/60 bg-rose-50/80 p-4 text-sm text-rose-700">{error}</div>
      )}
      {successMsg && (
        <div className="rounded-xl border border-emerald-300/60 bg-emerald-50/80 p-4 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      {isLoading && <Card className="bg-white/10 p-6 text-white">Carregando perfil...</Card>}

      {profile && !isLoading && (
        <>
          <Card className="grid gap-4 bg-white/90 p-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Nome</p>
              <p className="text-lg font-semibold text-slate-900">{profile.name || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">E-mail</p>
              <p className="text-lg font-semibold text-slate-900">{profile.email}</p>
              <p className="text-xs text-slate-500">
                {profile.email_verified ? 'E-mail verificado' : 'E-mail não verificado'}
              </p>
            </div>
          </Card>

          <Card className="bg-white/90 p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Notificações</p>
                <h2 className="text-xl font-semibold text-slate-900">Preferências</h2>
              </div>
              <label className="flex items-center gap-3 text-slate-800">
                <input
                  type="checkbox"
                  checked={notifPref}
                  onChange={(e) => setNotifPref(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-400 text-cyan-600 focus:ring-cyan-200"
                />
                Receber notificações por e-mail
              </label>
              <div className="flex justify-end">
                <Button intent="primary" onClick={savePreferences} disabled={isSavingPrefs}>
                  {isSavingPrefs ? 'Salvando...' : 'Salvar preferências'}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-white/90 p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Segurança</p>
                <h2 className="text-xl font-semibold text-slate-900">Alterar senha</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Senha atual</label>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Nova senha</label>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Confirmar nova senha</label>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button intent="primary" onClick={changePassword} disabled={isChangingPwd}>
                  {isChangingPwd ? 'Alterando...' : 'Alterar senha'}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-white/90 p-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Conta</p>
              <h2 className="text-xl font-semibold text-slate-900">Encerrar sessão ou excluir conta</h2>
              <div className="flex flex-wrap gap-3">
                <Button intent="secondary" onClick={() => supabase.auth.signOut().then(() => router.push('/'))}>
                  Sair
                </Button>
                <Button intent="danger" onClick={deleteAccount} disabled={isDeleting}>
                  {isDeleting ? 'Excluindo...' : 'Excluir conta'}
                </Button>
              </div>
              <p className="text-sm text-slate-600">
                Exclusão é soft delete: não remove gifts já criados, mas bloqueia novos envios e anonimiza dados futuros.
              </p>
            </div>
          </Card>
        </>
      )}
    </main>
  );
}
