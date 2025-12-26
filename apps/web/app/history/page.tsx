/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@giftpix/ui';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

type GiftStatus = 'active' | 'redeemed' | 'expired' | 'refunded';
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | undefined;

type HistoryItem = {
  gift_id: string;
  reference_id: string;
  amount: number;
  gift_status: GiftStatus;
  payment_status?: PaymentStatus;
  created_at: string;
};

type Summary = {
  totalGifts: number;
  totalSent: number;
  totalRefunded: number;
  redeemed: number;
  active: number;
  expired: number;
};

const giftLabel: Record<GiftStatus, string> = {
  active: 'Ativo',
  redeemed: 'Resgatado',
  expired: 'Expirado',
  refunded: 'Estornado',
};

const paymentLabel: Record<NonNullable<PaymentStatus>, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
  refunded: 'Estornado',
};

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [statusFilter, setStatusFilter] = useState<GiftStatus | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<'7' | '30' | '90' | 'all'>('30');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/#login');
      }
    });
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [histResp, summaryResp] = await Promise.all([
        fetch('/api/history', { cache: 'no-store' }),
        fetch('/api/history/summary', { cache: 'no-store' }),
      ]);
      const histJson = await histResp.json();
      const summaryJson = await summaryResp.json();
      if (!histResp.ok || histJson.success !== true) throw new Error(histJson?.error?.message || 'Erro ao carregar histórico');
      if (!summaryResp.ok || summaryJson.success !== true) throw new Error(summaryJson?.error?.message || 'Erro ao carregar resumo');
      setItems(histJson.data?.items || []);
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

  const filteredItems = useMemo(() => {
    const now = Date.now();
    const days = periodFilter === 'all' ? null : Number(periodFilter);
    return items.filter((item) => {
      const matchStatus = statusFilter === 'all' ? true : item.gift_status === statusFilter;
      const matchPeriod = days ? now - new Date(item.created_at).getTime() <= days * 24 * 60 * 60 * 1000 : true;
      return matchStatus && matchPeriod;
    });
  }, [items, statusFilter, periodFilter]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10 text-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Histórico</p>
          <h1 className="text-3xl font-bold">Relatórios GiftPix</h1>
          <p className="text-slate-100">Status de gifts e Pix, incluindo estornos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button intent="secondary" onClick={fetchData} disabled={isLoading}>
            Atualizar
          </Button>
          <Link href="/dashboard">
            <Button intent="secondary">Voltar</Button>
          </Link>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-300/60 bg-rose-50/80 p-4 text-sm text-rose-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white/90 p-4">
          <p className="text-sm text-slate-500">Gifts criados</p>
          <p className="text-2xl font-semibold text-slate-900">{summary?.totalGifts ?? 0}</p>
        </Card>
        <Card className="bg-white/90 p-4">
          <p className="text-sm text-slate-500">Valor enviado</p>
          <p className="text-2xl font-semibold text-slate-900">
            {(summary?.totalSent ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </Card>
        <Card className="bg-white/90 p-4">
          <p className="text-sm text-slate-500">Estornados</p>
          <p className="text-2xl font-semibold text-slate-900">
            {(summary?.totalRefunded ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </Card>
        <Card className="bg-white/90 p-4">
          <p className="text-sm text-slate-500">Resgatados</p>
          <p className="text-2xl font-semibold text-slate-900">{summary?.redeemed ?? 0}</p>
        </Card>
      </section>

      <section className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-200">Status</span>
          <select
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GiftStatus | 'all')}
          >
            <option value="all">Todos</option>
            <option value="active">Ativo</option>
            <option value="redeemed">Resgatado</option>
            <option value="expired">Expirado</option>
            <option value="refunded">Estornado</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-200">Período</span>
          <select
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as '7' | '30' | '90' | 'all')}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo período</option>
          </select>
        </div>
      </section>

      <section className="grid gap-3">
        {isLoading && <Card className="bg-white/10 p-4 text-white">Carregando...</Card>}
        {!isLoading &&
          filteredItems.map((item) => (
            <Card key={item.gift_id} className="flex flex-col gap-2 bg-white/90 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-slate-500">{new Date(item.created_at).toLocaleString('pt-BR')}</p>
                <p className="text-xl font-semibold text-slate-900">
                  {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                    Gift: {giftLabel[item.gift_status]}
                  </span>
                  {item.payment_status && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      Pix: {paymentLabel[item.payment_status]}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  onClick={() => navigator.clipboard?.writeText(item.reference_id)}
                >
                  Copiar referência
                </button>
                <Link href={`/dashboard/gifts/${item.reference_id}`}>
                  <Button intent="secondary" size="sm">
                    Ver detalhes
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        {!isLoading && filteredItems.length === 0 && (
          <Card className="bg-white/10 p-4 text-white">Nenhum gift encontrado para os filtros selecionados.</Card>
        )}
      </section>
    </main>
  );
}
