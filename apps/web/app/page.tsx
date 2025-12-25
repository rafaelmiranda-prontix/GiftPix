/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input } from '@giftpix/ui';
import { supabase } from '../lib/supabaseClient';

type GiftStatus = 'active' | 'redeemed' | 'expired';

interface Gift {
  reference_id: string;
  amount: number;
  status: GiftStatus;
  message?: string;
  expires_at?: string;
  created_at?: string;
}

export default function Home() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const [createPayload, setCreatePayload] = useState({
    amount: '100',
    pin: '',
    message: '',
    description: '',
    expires_at: '',
  });
  const [createResult, setCreateResult] = useState<{ reference_id: string; pin: string } | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [redeemPayload, setRedeemPayload] = useState({
    reference_id: '',
    pin: '',
    pix_key: '',
    description: '',
  });
  const [redeemResult, setRedeemResult] = useState<Record<string, unknown> | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const [statusData, setStatusData] = useState<Gift | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email || null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email || null);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setIsLoadingAuth(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSessionEmail(null);
  };

  const canUseApp = useMemo(() => !!sessionEmail, [sessionEmail]);

  const createGift = async () => {
    setIsCreating(true);
    setCreateError(null);
    setCreateResult(null);
    try {
      const resp = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(createPayload.amount),
          pin: createPayload.pin,
          message: createPayload.message,
          description: createPayload.description,
          expires_at: createPayload.expires_at || undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error?.message || 'Erro ao criar gift');
      setCreateResult({
        reference_id: data.data.gift.reference_id,
        pin: data.data.pin,
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsCreating(false);
    }
  };

  const redeemGift = async () => {
    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemResult(null);
    try {
      const resp = await fetch(`/api/gifts/${redeemPayload.reference_id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: redeemPayload.pin,
          pix_key: redeemPayload.pix_key,
          description: redeemPayload.description,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error?.message || 'Erro ao resgatar gift');
      setRedeemResult(data.data);
    } catch (error) {
      setRedeemError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsRedeeming(false);
    }
  };

  const fetchStatus = async (referenceId: string) => {
    setIsStatusLoading(true);
    setStatusError(null);
    setStatusData(null);
    try {
      const resp = await fetch(`/api/gifts/${referenceId}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error?.message || 'Erro ao consultar');
      setStatusData(data.data);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsStatusLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 sm:py-14">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">GiftPix</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Presenteie com Pix com experiência de gift card</h1>
          <p className="max-w-2xl text-slate-200">
            Crie um gift, compartilhe o PIN e o destinatário resgata com sua chave Pix. Liquidação via Asaas ou PagBank.
          </p>
        </div>
        <AuthPanel onSignIn={handleSignIn} onSignOut={handleSignOut} sessionEmail={sessionEmail} isLoading={isLoadingAuth} error={authError} />
      </header>

      {!canUseApp ? (
        <Card className="border-cyan-200/30 bg-white/10 text-white">
          <p className="text-sm text-slate-200">
            Faça login com Supabase para usar o dashboard. Use a conta configurada no projeto (email/senha). Apenas para uso interno.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white/90">
            <SectionTitle title="Criar Gift" subtitle="Defina valor, mensagem e PIN para compartilhar." />
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Valor (R$)"
                  type="number"
                  min="1"
                  value={createPayload.amount}
                  onChange={(e) => setCreatePayload({ ...createPayload, amount: e.target.value })}
                />
                <Input
                  label="PIN"
                  type="text"
                  placeholder="Segredo do gift"
                  value={createPayload.pin}
                  onChange={(e) => setCreatePayload({ ...createPayload, pin: e.target.value })}
                />
              </div>
              <Input
                label="Mensagem"
                placeholder="Feliz aniversário!"
                value={createPayload.message}
                onChange={(e) => setCreatePayload({ ...createPayload, message: e.target.value })}
              />
              <Input
                label="Descrição (opcional)"
                placeholder="GiftPix especial"
                value={createPayload.description}
                onChange={(e) => setCreatePayload({ ...createPayload, description: e.target.value })}
              />
              <Input
                label="Expira em (opcional)"
                type="datetime-local"
                value={createPayload.expires_at}
                onChange={(e) => setCreatePayload({ ...createPayload, expires_at: e.target.value })}
              />
              <div className="flex items-center justify-between">
                <Button intent="primary" size="lg" onClick={createGift} disabled={isCreating || !createPayload.pin}>
                  {isCreating ? 'Criando...' : 'Criar Gift'}
                </Button>
                {createError && <p className="text-sm text-rose-500">{createError}</p>}
              </div>
              {createResult && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                  <p><strong>Reference ID:</strong> {createResult.reference_id}</p>
                  <p><strong>PIN:</strong> {createResult.pin}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-white/90">
            <SectionTitle title="Resgatar Gift" subtitle="Valide PIN e informe a chave Pix para receber." />
            <div className="mt-4 space-y-3">
              <Input
                label="Reference ID"
                value={redeemPayload.reference_id}
                onChange={(e) => setRedeemPayload({ ...redeemPayload, reference_id: e.target.value })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="PIN"
                  value={redeemPayload.pin}
                  onChange={(e) => setRedeemPayload({ ...redeemPayload, pin: e.target.value })}
                />
                <Input
                  label="Chave Pix"
                  placeholder="email/telefone/CPF/CNPJ/EVP"
                  value={redeemPayload.pix_key}
                  onChange={(e) => setRedeemPayload({ ...redeemPayload, pix_key: e.target.value })}
                />
              </div>
              <Input
                label="Descrição (opcional)"
                value={redeemPayload.description}
                onChange={(e) => setRedeemPayload({ ...redeemPayload, description: e.target.value })}
              />
              <div className="flex items-center justify-between">
                <Button intent="primary" size="lg" onClick={redeemGift} disabled={isRedeeming}>
                  {isRedeeming ? 'Processando...' : 'Resgatar Gift'}
                </Button>
                {redeemError && <p className="text-sm text-rose-500">{redeemError}</p>}
              </div>
              {redeemResult && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                  <p><strong>Provider:</strong> {redeemResult.provider}</p>
                  <p><strong>ID Transfer:</strong> {redeemResult.transfer?.id}</p>
                  <p><strong>Status:</strong> {redeemResult.transfer?.status}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {canUseApp && (
        <Card className="bg-white/80">
          <SectionTitle title="Status do Gift" subtitle="Consulte a situação de um gift já criado." />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              className="sm:max-w-sm"
              label="Reference ID"
              value={redeemPayload.reference_id}
              onChange={(e) => setRedeemPayload({ ...redeemPayload, reference_id: e.target.value })}
            />
            <Button intent="secondary" size="md" onClick={() => fetchStatus(redeemPayload.reference_id)} disabled={isStatusLoading}>
              {isStatusLoading ? 'Consultando...' : 'Consultar'}
            </Button>
            {statusError && <p className="text-sm text-rose-500">{statusError}</p>}
          </div>
          {statusData && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
              <p><strong>Reference ID:</strong> {statusData.reference_id}</p>
              <p><strong>Status:</strong> {statusData.status}</p>
              <p><strong>Valor:</strong> R$ {statusData.amount?.toFixed(2)}</p>
              {statusData.message && <p><strong>Mensagem:</strong> {statusData.message}</p>}
              {statusData.expires_at && <p><strong>Expira em:</strong> {new Date(statusData.expires_at).toLocaleString()}</p>}
            </div>
          )}
        </Card>
      )}
    </main>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

function AuthPanel({
  sessionEmail,
  onSignIn,
  onSignOut,
  isLoading,
  error,
}: {
  sessionEmail: string | null;
  onSignIn: (email: string, password: string) => void;
  onSignOut: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (sessionEmail) {
    return (
      <Card className="bg-white/10 text-white">
        <p className="text-sm">Logado como {sessionEmail}</p>
        <Button intent="secondary" size="sm" className="mt-2" onClick={onSignOut}>
          Sair
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 text-white">
      <div className="flex flex-col gap-2">
        <input
          className="h-10 rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="h-10 rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none"
          type="password"
          placeholder="senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button intent="primary" size="sm" onClick={() => onSignIn(email, password)} disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
        {error && <p className="text-xs text-rose-200">{error}</p>}
      </div>
    </Card>
  );
}
