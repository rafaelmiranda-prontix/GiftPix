/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Button, Card } from '@giftpix/ui';
import { supabase } from '../../../../lib/supabaseClient';

type GiftStatus = 'active' | 'redeemed' | 'expired';
type ProviderStatus = 'pending' | 'completed' | 'failed' | undefined;

type GiftDetail = {
  reference_id: string;
  amount: number;
  status: GiftStatus;
  message?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
};

type QrResponse = {
  success: boolean;
  data?: {
    qrDataUrl: string;
    url: string;
  };
  error?: { message?: string };
};

type ApiResponse = {
  success: boolean;
  data?: {
    gift: GiftDetail;
    paymentStatus?: ProviderStatus;
    providerRef?: string;
  };
  error?: { message?: string };
};

const statusLabel: Record<GiftStatus, string> = {
  active: 'Ativo',
  redeemed: 'Resgatado',
  expired: 'Expirado',
};

const statusBadge: Record<GiftStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  redeemed: 'bg-slate-200 text-slate-600',
  expired: 'bg-amber-100 text-amber-800',
};

const paymentBadge: Record<NonNullable<ProviderStatus>, string> = {
  pending: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-rose-100 text-rose-800',
};

export default function GiftDetailPage({ params }: { params: { reference: string } }) {
  const { reference } = params;
  const [giftData, setGiftData] = useState<GiftDetail | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<ProviderStatus>(undefined);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [localPin, setLocalPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinInfo, setShowPinInfo] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session));
    });
  }, []);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(`gift_pin_${reference}`) : null;
    if (stored) setLocalPin(stored);
  }, [reference]);

  const shareUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${base}/redeem?ref=${reference}`;
  }, [reference]);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/gifts/${reference}`, { cache: 'no-store' });
      const data: ApiResponse = await resp.json();
      if (!resp.ok || data.success !== true || !data.data?.gift) {
        throw new Error(data.error?.message || 'Gift não encontrado');
      }
      setGiftData(data.data.gift);
      setPaymentStatus(data.data.paymentStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    fetchDetail();
  }, [reference, fetchDetail]);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const resp = await fetch(`/api/gifts/${reference}/qrcode`, { cache: 'no-store' });
        const data: QrResponse = await resp.json();
        if (resp.ok && data.success && data.data?.qrDataUrl) {
          setQrDataUrl(data.data.qrDataUrl);
        }
      } catch (err) {
        console.warn('Falha ao carregar QR Code', err);
      }
    };
    fetchQr();
  }, [reference]);

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 text-white">
        <Card className="bg-white/10 p-6 text-white">
          <h1 className="text-2xl font-semibold">Detalhes do GiftPix</h1>
          <p className="mt-2 text-slate-100">Faça login para ver os detalhes do GiftPix.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/#login">
              <Button intent="primary">Login</Button>
            </Link>
            <Link href="/#login">
              <Button intent="secondary">Criar conta</Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">GiftPix</p>
          <h1 className="text-3xl font-bold">Detalhes do presente</h1>
          <p className="text-slate-100">Acompanhe status, compartilhe o link e veja informações do gift.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard">
            <Button intent="secondary">Voltar</Button>
          </Link>
          <Button intent="secondary" onClick={fetchDetail} disabled={isLoading}>
            Atualizar
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card className="bg-white/10 p-6 text-white">Carregando detalhes...</Card>
      )}

      {error && (
        <div className="rounded-xl border border-rose-300/60 bg-rose-50/80 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && giftData && (
        <>
          <Card className="bg-white/90 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Valor do GiftPix</p>
                <p className="text-3xl font-bold text-slate-900">
                  {giftData.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-sm text-slate-600">
                  Criado em {new Date(giftData.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[giftData.status]}`}>
                  {statusLabel[giftData.status]}
                </span>
                {paymentStatus && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge[paymentStatus]}`}>
                    Pagamento: {paymentStatus === 'completed' ? 'Confirmado' : paymentStatus === 'pending' ? 'Pendente' : 'Falhou'}
                  </span>
                )}
              </div>
            </div>
            {giftData.status === 'redeemed' && (
              <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
                Este GiftPix já foi resgatado com sucesso 🎉
              </div>
            )}
            {giftData.status === 'expired' && (
              <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                Este GiftPix expirou e não pode mais ser utilizado.
              </div>
            )}
          </Card>

          {giftData.status === 'active' ? (
            <Card className="bg-white/90 p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_1.2fr] md:items-center">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Compartilhar</p>
                  <h2 className="text-xl font-semibold text-slate-900">Link e compartilhamento</h2>
                  <p className="text-sm text-slate-700">
                    Envie o link com o PIN para o presenteado. O resgate exige PIN + chave Pix.
                  </p>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">Link de status</p>
                    <p className="break-words text-sm text-slate-800">{shareUrl}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() => navigator.clipboard?.writeText(shareUrl)}
                      >
                        Copiar link
                      </Button>
                      <Link href={shareUrl} prefetch={false}>
                        <Button intent="primary" size="sm">
                          Abrir status
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  {qrDataUrl ? (
                    <>
                      <img src={qrDataUrl} alt="QR Code do GiftPix" className="h-56 w-56" />
                      <p className="text-xs text-center text-slate-500">
                        Escaneie para abrir o status e resgatar com PIN.
                      </p>
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() => navigator.clipboard?.writeText(shareUrl)}
                      >
                        Copiar link para compartilhar
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-slate-600">Gerando QR Code...</div>
                  )}
                </div>
              </div>
            </Card>
          ) : null}

          <Card className="bg-white/90 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Código secreto (PIN)</h3>
                <p className="text-sm text-slate-600">
                  O PIN é necessário para resgate. Ele não fica salvo em texto puro; guardamos apenas no seu navegador ao criar.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono text-slate-900">
                    {localPin ? localPin : showPinInfo ? 'PIN exibido apenas na criação' : '••••••'}
                  </span>
                  <Button intent="secondary" size="sm" onClick={() => setShowPinInfo((v) => !v)}>
                    {showPinInfo ? 'Ocultar' : 'Mostrar aviso'}
                  </Button>
                  {localPin && (
                    <Button intent="primary" size="sm" onClick={() => navigator.clipboard?.writeText(localPin)}>
                      Copiar PIN
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Mensagem</h3>
                <p className="text-sm text-slate-700">{giftData.message || 'Nenhuma mensagem personalizada'}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Referência</p>
                <p className="text-sm font-semibold text-slate-900 break-words">{giftData.reference_id}</p>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-cyan-700 underline"
                  onClick={() => navigator.clipboard?.writeText(giftData.reference_id)}
                >
                  Copiar referência
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Validade</p>
                <p className="text-sm text-slate-800">
                  {giftData.expires_at
                    ? new Date(giftData.expires_at).toLocaleDateString('pt-BR')
                    : 'Sem validade configurada'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Regras</p>
                <p className="text-sm text-slate-800">Uso único · Não reembolsável após resgate · Não editável</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </main>
  );
}
