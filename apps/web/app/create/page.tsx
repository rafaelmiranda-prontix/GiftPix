/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@giftpix/ui';
import { supabase } from '../../lib/supabaseClient';

type Step = 1 | 2 | 3 | 4;

type GiftResponse = {
  reference_id: string;
  pin: string;
  status: string;
  amount: number;
};

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 5000;

const quickValues = [50, 100, 200, 500];

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CreateGiftPage() {
  const [step, setStep] = useState<Step>(1);
  const [amountInput, setAmountInput] = useState<string>('100,00');
  const [message, setMessage] = useState<string>('');
  const [pin, setPin] = useState<string>(generatePin());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<GiftResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session));
    });
  }, []);

  const amount = useMemo(() => {
    const clean = amountInput.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = Number(parseFloat(clean).toFixed(2));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountInput]);

  function generatePin(): string {
    // PIN de 6 dígitos para evitar trivialidade
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const validateAmount = () => {
    if (amount < MIN_AMOUNT) return `Valor mínimo é ${formatBRL(MIN_AMOUNT)}`;
    if (amount > MAX_AMOUNT) return `Valor máximo é ${formatBRL(MAX_AMOUNT)}`;
    return null;
  };

  const goToNext = () => {
    const err = validateAmount();
    if (step === 1 && err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((prev) => (prev + 1) as Step);
  };

  const goToPrev = () => {
    setError(null);
    setStep((prev) => Math.max(1, (prev - 1) as Step) as Step);
  };

  const handleSubmit = async () => {
    const err = validateAmount();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          message: message || undefined,
          pin,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || data?.success !== true) {
        throw new Error(data?.error?.message || 'Não foi possível criar o GiftPix');
      }
      setResult({
        reference_id: data?.data?.gift?.reference_id,
        status: data?.data?.gift?.status,
        pin: data?.data?.pin,
        amount: data?.data?.gift?.amount,
      });
      if (data?.data?.gift?.reference_id && data?.data?.pin) {
        localStorage.setItem(`gift_pin_${data.data.gift.reference_id}`, data.data.pin);
      }
      setStep(4);
    } catch (errSubmit) {
      setError(errSubmit instanceof Error ? errSubmit.message : 'Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = useMemo(() => {
    if (!result?.reference_id) return '';
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${base}/status?ref=${result.reference_id}`;
  }, [result?.reference_id]);

  const steps: { id: Step; label: string }[] = [
    { id: 1, label: 'Valor' },
    { id: 2, label: 'Mensagem' },
    { id: 3, label: 'Revisão' },
    { id: 4, label: 'Gift gerado' },
  ];

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 text-white">
        <Card className="bg-white/10 p-6 text-white">
          <h1 className="text-2xl font-semibold">Criação de GiftPix</h1>
          <p className="mt-2 text-slate-100">Faça login ou crie sua conta para gerar um GiftPix.</p>
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
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Criar GiftPix</p>
        <h1 className="text-3xl font-bold">Fluxo guiado em 4 passos</h1>
        <p className="text-slate-100">Defina valor, mensagem, revise e gere o seu GiftPix com PIN único.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              step === s.id ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-100'
            }`}
          >
            {s.id}. {s.label}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300/60 bg-rose-50/80 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <Card className="bg-white/90 p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Defina o valor</h2>
              <p className="text-sm text-slate-600">Mínimo {formatBRL(MIN_AMOUNT)} · Máximo {formatBRL(MAX_AMOUNT)}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1.2fr_1fr]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Valor do GiftPix</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  inputMode="decimal"
                  placeholder="100,00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Sugestões rápidas</label>
                <div className="flex flex-wrap gap-2">
                  {quickValues.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:bg-cyan-50"
                      onClick={() => setAmountInput(formatBRL(val))}
                    >
                      {formatBRL(val)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Link href="/dashboard">
                <Button intent="secondary">Cancelar</Button>
              </Link>
              <Button intent="primary" onClick={goToNext}>
                Continuar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="bg-white/90 p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Mensagem (opcional)</h2>
              <p className="text-sm text-slate-600">140 caracteres para deixar o gift com cara de presente.</p>
            </div>
            <textarea
              maxLength={140}
              className="min-h-[140px] rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Feliz aniversário! Aproveite 🎉"
            />
            <div className="text-right text-xs text-slate-500">{message.length}/140</div>
            <div className="flex justify-between">
              <Button intent="secondary" onClick={goToPrev}>
                Voltar
              </Button>
              <Button intent="primary" onClick={goToNext}>
                Revisar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="bg-white/90 p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Revisar GiftPix</h2>
              <p className="text-sm text-slate-600">Confirme antes de gerar o PIN e o link.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Valor</p>
                <p className="text-2xl font-semibold text-slate-900">{formatBRL(amount)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">PIN</p>
                <p className="text-xl font-semibold text-slate-900">{pin}</p>
                <p className="text-xs text-slate-500">Use esse PIN para o presenteado resgatar.</p>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-cyan-700 underline"
                  onClick={() => setPin(generatePin())}
                >
                  Gerar outro PIN
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Mensagem</p>
              <p className="text-slate-800">{message || 'Sem mensagem personalizada'}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <span>• Uso único com PIN obrigatório</span>
              <span>• Status: criado e ativo após confirmação</span>
              <span>• Logs e RLS protegidos no Supabase</span>
            </div>
            <div className="flex justify-between">
              <Button intent="secondary" onClick={goToPrev}>
                Voltar
              </Button>
              <Button intent="primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Gerando...' : 'Gerar GiftPix'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 4 && result && (
        <Card className="bg-white/90 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">GiftPix pronto</p>
                <h2 className="text-2xl font-bold text-slate-900">Compartilhe com segurança</h2>
                <p className="text-sm text-slate-600">
                  Envie o PIN e o link de status para o presenteado. Ele vai precisar do PIN + chave Pix para resgatar.
                </p>
              </div>
              <Link href="/dashboard">
                <Button intent="secondary">Voltar para a Home</Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Valor</p>
                <p className="text-2xl font-semibold text-slate-900">{formatBRL(result.amount)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Status</p>
                <p className="text-lg font-semibold text-slate-900">{result.status}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">PIN</p>
                <p className="text-xl font-semibold text-slate-900">{result.pin}</p>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-cyan-700 underline"
                  onClick={() => navigator.clipboard?.writeText(result.pin)}
                >
                  Copiar PIN
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Referência</p>
                <p className="text-sm font-semibold text-slate-900">{result.reference_id}</p>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-cyan-700 underline"
                  onClick={() => navigator.clipboard?.writeText(result.reference_id)}
                >
                  Copiar referência
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Link de acompanhamento</p>
              <p className="text-sm text-slate-800 break-words">{shareUrl}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() => navigator.clipboard?.writeText(shareUrl)}
                  disabled={!shareUrl}
                >
                  Copiar link
                </Button>
                <Link href={shareUrl || '#'} prefetch={false}>
                  <Button intent="primary" size="sm" disabled={!shareUrl}>
                    Abrir status
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/create">
                <Button intent="secondary">Criar outro GiftPix</Button>
              </Link>
              <Link href="/dashboard">
                <Button intent="primary">Ver meus gifts</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </main>
  );
}
