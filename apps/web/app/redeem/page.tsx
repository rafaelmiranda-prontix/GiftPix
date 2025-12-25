/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@giftpix/ui';
import Link from 'next/link';

type GiftStatus = 'active' | 'redeemed' | 'expired';
type ProviderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | undefined;

type GiftDetail = {
  reference_id: string;
  amount: number;
  status: GiftStatus;
  message?: string;
  expires_at?: string;
  created_at: string;
};

type StatusResponse = {
  success: boolean;
  data?: {
    gift: GiftDetail;
    paymentStatus?: ProviderStatus;
    providerRef?: string;
  };
  error?: { message?: string };
};

type RedeemResponse = {
  success: boolean;
  data?: {
    provider: string;
    transfer: {
      id: string;
      status: ProviderStatus;
    };
  };
  error?: { message?: string };
};

type ValidateResponse = {
  success: boolean;
  data?: { gift: GiftDetail };
  error?: { message?: string };
};

type Step = 1 | 2 | 3 | 4 | 5; // boas-vindas, PIN, Pix, confirmação, concluído

const statusLabel: Record<GiftStatus, string> = {
  active: 'Ativo',
  redeemed: 'Resgatado',
  expired: 'Expirado',
};

export default function RedeemPage({ searchParams }: { searchParams: { ref?: string } }) {
  const reference = searchParams.ref || '';
  const [giftData, setGiftData] = useState<GiftDetail | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<ProviderStatus>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixType, setPixType] = useState<'email' | 'cpf' | 'phone' | 'random'>('email');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<RedeemResponse['data'] | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [pinValidated, setPinValidated] = useState(false);

  const fetchStatus = useCallback(
    async (ref: string) => {
      if (!ref) return;
      setIsLoading(true);
      setError(null);
      try {
        const resp = await fetch(`/api/gifts/${ref}`, { cache: 'no-store' });
        const data: StatusResponse = await resp.json();
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
    },
    []
  );

  useEffect(() => {
    if (reference) fetchStatus(reference);
  }, [reference, fetchStatus]);

  const handleValidatePin = async () => {
    if (!reference) {
      setError('Referência ausente.');
      return;
    }
    if (!pin) {
      setError('Informe o PIN para continuar.');
      return;
    }
    setError(null);
    try {
      const resp = await fetch(`/api/gifts/${reference}/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data: ValidateResponse = await resp.json();
      if (!resp.ok || data.success !== true) {
        throw new Error(data.error?.message || 'PIN inválido. Tente novamente.');
      }
      setPinValidated(true);
      setGiftData((prev) => data.data?.gift || prev);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
      setPinValidated(false);
    }
  };

  const validatePixKey = () => {
    if (!pixKey) return 'Informe a chave Pix.';
    if (pixType === 'email' && !/.+@.+\..+/.test(pixKey)) return 'E-mail inválido.';
    if (pixType === 'cpf' && pixKey.replace(/\D/g, '').length !== 11) return 'CPF inválido.';
    if (pixType === 'phone' && pixKey.replace(/\D/g, '').length < 10) return 'Telefone inválido.';
    return null;
  };

  const handleRedeem = async () => {
    if (!reference) {
      setError('Informe a referência do GiftPix.');
      return;
    }
    const pixError = validatePixKey();
    if (pixError) {
      setError(pixError);
      return;
    }
    setError(null);
    setIsRedeeming(true);
    setRedeemResult(null);
    try {
      const resp = await fetch(`/api/gifts/${reference}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, pix_key: pixKey }),
      });
      const data: RedeemResponse = await resp.json();
      if (!resp.ok || data.success !== true) {
        throw new Error(data.error?.message || 'Não foi possível resgatar');
      }
      setRedeemResult(data.data || null);
      await fetchStatus(reference);
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsRedeeming(false);
    }
  };

  const canAdvanceToPix = pinValidated;
  const canAdvanceToConfirm = validatePixKey() === null;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 text-white">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Redeem GiftPix</p>
        <h1 className="text-3xl font-bold">Ótimo! Resgate seu GiftPix</h1>
        <p className="text-slate-100">
          Use PIN + chave Pix para receber. Leia a mensagem do presente e confirme o resgate sem login.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              step === s ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-100'
            }`}
          >
            {s === 1
              ? 'Boas-vindas'
              : s === 2
                ? 'PIN'
                : s === 3
                  ? 'Chave Pix'
                  : s === 4
                    ? 'Confirmação'
                    : 'Concluído'}
          </span>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300/60 bg-rose-50/80 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading && <Card className="bg-white/10 p-5 text-white">Carregando...</Card>}

      {!isLoading && giftData && (
        <>
          {step === 1 && (
            <Card className="bg-white/90 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Você recebeu um GiftPix 🎁</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {giftData.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-sm text-slate-600">
                    Criado em {new Date(giftData.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      giftData.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : giftData.status === 'redeemed'
                          ? 'bg-slate-200 text-slate-700'
                          : giftData.status === 'refunded'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {statusLabel[giftData.status]}
                  </span>
                  {paymentStatus && (
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                      Pix:{' '}
                      {paymentStatus === 'completed'
                        ? 'Concluído'
                        : paymentStatus === 'processing' || paymentStatus === 'pending'
                          ? 'Processando'
                          : paymentStatus === 'refunded'
                            ? 'Estornado'
                            : 'Falhou'}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Mensagem</p>
                <p className="text-sm text-slate-700">{giftData.message || 'Parabéns! Você recebeu um GiftPix.'}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button intent="primary" onClick={() => setStep(2)} disabled={giftData.status !== 'active'}>
                  Resgatar GiftPix
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="bg-white/90 p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Passo 2</p>
                  <h2 className="text-xl font-semibold text-slate-900">Valide o PIN</h2>
                  <p className="text-sm text-slate-700">Digite o código secreto que recebeu junto ao GiftPix.</p>
                </div>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN do GiftPix"
                />
                <div className="flex justify-between">
                  <Button intent="secondary" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button intent="primary" onClick={handleValidatePin}>
                    Validar PIN
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="bg-white/90 p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Passo 3</p>
                  <h2 className="text-xl font-semibold text-slate-900">Informe a chave Pix</h2>
                  <p className="text-sm text-slate-700">Escolha o tipo e informe a chave que receberá o valor.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr]">
                  <select
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                    value={pixType}
                    onChange={(e) => setPixType(e.target.value as typeof pixType)}
                  >
                    <option value="email">E-mail</option>
                    <option value="cpf">CPF</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Chave aleatória</option>
                  </select>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Informe sua chave Pix"
                  />
                </div>
                <div className="flex justify-between">
                  <Button intent="secondary" onClick={() => setStep(2)}>
                    Voltar
                  </Button>
                  <Button intent="primary" onClick={() => setStep(4)} disabled={!canAdvanceToPix || !!validatePixKey()}>
                    Continuar
                  </Button>
                </div>
              </div>
            </Card>
          )}

            {step === 4 && (
              <Card className="bg-white/90 p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Passo 4</p>
                    <h2 className="text-xl font-semibold text-slate-900">Confirme o resgate</h2>
                  <p className="text-sm text-slate-700">Verifique os dados antes de enviar. Operação irreversível.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Valor</p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {giftData.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Chave Pix</p>
                    <p className="text-sm font-semibold text-slate-900 break-words">{pixKey}</p>
                    <p className="text-xs text-slate-500">Tipo: {pixType}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
                  Uso único · Operação irreversível · PIN obrigatório
                </div>
                <div className="flex justify-between">
                  <Button intent="secondary" onClick={() => setStep(3)}>
                    Voltar
                  </Button>
                  <Button intent="primary" onClick={handleRedeem} disabled={!canAdvanceToConfirm || isRedeeming}>
                    {isRedeeming ? 'Enviando Pix...' : 'Confirmar resgate'}
                  </Button>
                  </div>
                </div>
              </Card>
            )}

          {step === 5 && redeemResult && (
            <Card className="bg-white/90 p-6">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Resgate concluído</p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {redeemResult.transfer.status === 'completed'
                    ? 'Pix enviado com sucesso 🎉'
                    : redeemResult.transfer.status === 'processing' || redeemResult.transfer.status === 'pending'
                      ? 'Pix em processamento'
                      : redeemResult.transfer.status === 'refunded'
                        ? 'Pix estornado'
                        : 'Falha no Pix'}
                </h2>
                <p className="text-sm text-slate-700">
                  Valor: {giftData.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · Status Pix:{' '}
                  {redeemResult.transfer.status}
                </p>
                {redeemResult.transfer.id && (
                  <p className="text-sm text-slate-600">ID da transferência: {redeemResult.transfer.id}</p>
                )}
                {redeemResult.transfer.status === 'pending' || redeemResult.transfer.status === 'processing' ? (
                  <p className="text-sm text-slate-600">
                    O Pix foi solicitado e está sendo processado. Pode levar alguns instantes para aparecer.
                  </p>
                ) : null}
                {redeemResult.transfer.status === 'failed' ? (
                  <p className="text-sm text-rose-600">
                    Houve um problema no envio do Pix. Nossa equipe está processando a correção.
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Link href="/">
                    <Button intent="secondary">Voltar para a home</Button>
                  </Link>
                  <Button intent="primary" onClick={() => fetchStatus(reference)}>
                    Ver status atualizado
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </main>
  );
}
