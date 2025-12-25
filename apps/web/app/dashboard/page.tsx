/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@giftpix/ui';
import { supabase } from '../../lib/supabaseClient';

type GiftStatus = 'active' | 'redeemed' | 'expired';

type GiftItem = {
  id: string;
  reference_id: string;
  amount: number;
  status: GiftStatus;
  message?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
};

type Summary = {
  total: number;
  redeemed: number;
  active: number;
  expired: number;
  totalAmount: number;
};

const statusLabel: Record<GiftStatus, string> = {
  active: 'Ativo',
  redeemed: 'Resgatado',
  expired: 'Expirado',
};

const statusBadgeColor: Record<GiftStatus, string> = {
  active: 'bg-cyan-100 text-cyan-800',
  redeemed: 'bg-emerald-100 text-emerald-800',
  expired: 'bg-slate-200 text-slate-600',
};

export default function DashboardPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('você');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.name as string | undefined;
      const email = data.user?.email;
      setUserName(name || (email ? email.split('@')[0] : 'você'));
    });
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [giftsResp, summaryResp] = await Promise.all([
        fetch('/api/gifts', { cache: 'no-store' }),
        fetch('/api/gifts/summary', { cache: 'no-store' }),
      ]);

      const giftsJson = await giftsResp.json();
      const summaryJson = await summaryResp.json();

      if (!giftsResp.ok || giftsJson?.success !== true) {
        throw new Error(giftsJson?.error?.message || 'Falha ao carregar gifts');
      }
      if (!summaryResp.ok || summaryJson?.success !== true) {
        throw new Error(summaryJson?.error?.message || 'Falha ao carregar resumo');
      }

      setGifts(giftsJson.data?.gifts || []);
      setSummary(summaryJson.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const emptyState = gifts.length === 0 && !isLoading && !error;

  const quickStats = useMemo(
    () => [
      { label: 'Gifts criados', value: summary?.total ?? 0, tone: 'from-sky-400 to-blue-500' },
      { label: 'Resgatados', value: summary?.redeemed ?? 0, tone: 'from-emerald-400 to-emerald-600' },
      { label: 'Pendentes', value: summary?.active ?? 0, tone: 'from-amber-300 to-orange-500' },
      {
        label: 'Valor total enviado',
        value:
          summary?.totalAmount != null
            ? summary.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : '—',
        tone: 'from-indigo-400 to-violet-600',
      },
    ],
    [summary]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-xl backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Home logada</p>
            <h1 className="text-3xl font-bold sm:text-4xl">Olá, {userName} 👋</h1>
            <p className="mt-2 max-w-2xl text-slate-100">
              Aqui você acompanha seus GiftPix, vê status em tempo real e cria novos presentes. Tudo simples e seguro.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/">
              <Button intent="secondary">Voltar para a landing</Button>
            </Link>
            <Link href="/?flow=create">
              <Button intent="primary">Criar novo GiftPix</Button>
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-cyan-100">Dados protegidos</span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-cyan-100">RLS ativado</span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-cyan-100">API Key segura</span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden bg-white/90 p-4">
            <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${stat.tone}`} />
            <p className="mt-3 text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-900">
              {typeof stat.value === 'number' ? stat.value.toLocaleString('pt-BR') : stat.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Histórico</p>
            <h2 className="text-2xl font-bold">Gifts criados</h2>
            <p className="text-sm text-slate-100">Status e valores em tempo real, direto do backend.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button intent="secondary" onClick={fetchData} disabled={isLoading}>
              Atualizar
            </Button>
            <Link href="/?flow=create">
              <Button intent="primary">Criar novo GiftPix</Button>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center rounded-xl border border-white/5 bg-white/5 p-6 text-sm text-slate-100">
            Carregando gifts...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-300/60 bg-rose-50/80 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {emptyState && (
          <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-slate-100">
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">Primeiro acesso</div>
            <h3 className="text-xl font-semibold text-white">Você ainda não criou nenhum GiftPix.</h3>
            <p className="text-sm text-slate-200">Crie seu primeiro presente e acompanhe tudo aqui.</p>
            <Link href="/?flow=create">
              <Button intent="primary">Criar meu primeiro GiftPix</Button>
            </Link>
          </div>
        )}

        {!emptyState && !isLoading && (
          <div className="grid gap-3">
            {gifts.map((gift) => (
              <Card key={gift.id} className="flex flex-col gap-3 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeColor[gift.status]}`}>
                      {statusLabel[gift.status]}
                    </span>
                    <span className="text-lg font-semibold text-slate-900">
                      {gift.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Criado em {new Date(gift.created_at).toLocaleDateString('pt-BR')} · Ref: <code>{gift.reference_id}</code>
                  </p>
                  {gift.message && <p className="text-sm text-slate-700">Mensagem: {gift.message}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    onClick={() => navigator.clipboard?.writeText(gift.reference_id)}
                  >
                    Copiar referência
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    onClick={() => navigator.clipboard?.writeText(`Ref: ${gift.reference_id}`)}
                  >
                    Copiar para compartilhar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
