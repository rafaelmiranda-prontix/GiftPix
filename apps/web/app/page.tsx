/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { Button, Card } from '@giftpix/ui';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const howItWorks = [
  { title: 'Crie o GiftPix', desc: 'Defina valor, mensagem e PIN. O QR/link leva o presenteado ao resgate.', icon: '🎁' },
  { title: 'Compartilhe', desc: 'Envie QR ou link com o PIN pelo canal que preferir.', icon: '🔗' },
  { title: 'Resgate via Pix', desc: 'Quem recebe informa PIN + chave Pix e recebe na hora.', icon: '⚡' },
];

const benefits = [
  { title: 'Sem chave Pix do destinatário', desc: 'Basta enviar o link + PIN; ele escolhe a chave.' },
  { title: 'Seguro', desc: 'Uso único, PIN obrigatório, logs e RLS no Supabase.' },
  { title: 'Experiência de presente', desc: 'Mensagem personalizada e fluxo dedicado a gifts.' },
  { title: 'Multi-provider', desc: 'Asaas ou PagBank para liquidação Pix.' },
];

const useCases = ['🎂 Aniversários', '💍 Casamentos', '🎄 Datas comemorativas', '🏆 Premiações e bônus', '🎁 Corporativo'];

const trustPoints = [
  'O QR/Link não transfere dinheiro sozinho',
  'PIN obrigatório para resgatar',
  'Integração Pix via PSP homologado',
  'Dados protegidos (LGPD)',
];

export default function Home() {
  const router = useRouter();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [name, setName] = useState('');

  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    let redirected = false;
    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email || null);
      if (data.session && !redirected) {
        redirected = true;
        router.push('/dashboard');
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email || null);
      if (session && !redirected) {
        redirected = true;
        router.push('/dashboard');
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [router]);

  const handleSignIn = async (email: string, password: string) => {
    if (!email || !password || password.length < 8) {
      setAuthError('Informe e-mail e senha (mínimo 8 caracteres)');
      return;
    }
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error?.message || 'Erro ao entrar');
      const session = data?.data?.session;
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }
      setSessionEmail(data?.data?.user?.email || email);
      pushToast('Login realizado', 'success');
      router.push('/dashboard');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
    setIsLoadingAuth(false);
  };

  const handleSignUp = async (email: string, password: string, fullName?: string) => {
    if (!email || !password || password.length < 8) {
      setAuthError('Informe e-mail e senha (mínimo 8 caracteres)');
      return;
    }
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: fullName }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error?.message || 'Erro ao criar conta');
      pushToast('Conta criada. Verifique seu e-mail.', 'success');
      const session = data?.data?.session;
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        setSessionEmail(data?.data?.user?.email || email);
      }
      router.push('/dashboard');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
    setIsLoadingAuth(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSessionEmail(null);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-8 sm:py-12">
      <ToastStack toasts={toasts} />
      <nav className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
            GP
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">GiftPix</span>
            <span className="text-xs text-slate-500">Pix com experiência de presente</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <Link href="#como-funciona" className="hover:text-[var(--color-primary)]">
            Como funciona
          </Link>
          <Link href="/create">
            <Button intent="primary" size="sm">
              Criar GiftPix
            </Button>
          </Link>
        </div>
      </nav>
      <header className="grid gap-8 rounded-3xl bg-[var(--color-surface)] p-6 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fde68a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
            GiftPix · Pix seguro
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Presentes instantâneos com liquidação Pix e experiência de gift card.
          </h1>
          <p className="max-w-2xl text-lg text-slate-700">
            Crie o GiftPix, compartilhe o PIN e o presenteado resgata com a chave Pix. Segurança, RLS e logs para total confiança.
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-slate-700">
            <span className="rounded-full bg-[#fcebea] px-3 py-1 text-[var(--color-primary)]">Asaas / PagBank</span>
            <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-slate-700">PIN + Pix Key</span>
            <span className="rounded-full bg-[#fff7e6] px-3 py-1 text-[#b38600]">Prisma + Supabase</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/create">
              <Button intent="primary" size="lg">
                Criar meu GiftPix
              </Button>
            </Link>
            <Link href="#como-funciona">
              <Button intent="secondary" size="lg">
                Como funciona
              </Button>
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <AuthPanel
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            onSignOut={handleSignOut}
            sessionEmail={sessionEmail}
            isLoading={isLoadingAuth}
            error={authError}
            onForgotPassword={async (email) => {
              if (!email) {
                setAuthError('Informe o e-mail para recuperar.');
                return;
              }
              setIsLoadingAuth(true);
              setAuthError(null);
              const resp = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });
              const data = await resp.json();
              if (!resp.ok) {
                setAuthError(data?.error?.message || 'Erro ao enviar e-mail de recuperação');
              } else {
                pushToast('E-mail de recuperação enviado.', 'info');
              }
              setIsLoadingAuth(false);
            }}
            name={name}
            onNameChange={setName}
          />
        </div>
      </header>

      <section id="como-funciona" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">Como funciona</p>
            <h2 className="text-2xl font-bold text-slate-900">3 passos para enviar um GiftPix</h2>
          </div>
          <Link href="#gift-flow">
            <Button intent="secondary" size="sm">
              Criar agora
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {howItWorks.map((item) => (
            <Card key={item.title} className="bg-white">
              <div className="text-2xl">{item.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="beneficios" className="grid gap-4 rounded-2xl bg-gradient-to-br from-white via-[#fff9f4] to-white p-6 ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">Por que GiftPix</p>
          <h2 className="text-2xl font-bold text-slate-900">Mais do que um Pix comum</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((b) => (
            <Card key={b.title} className="bg-white ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">{b.title}</h3>
              <p className="text-sm text-slate-600">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="casos-uso" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">Casos de uso</p>
          <h2 className="text-2xl font-bold text-slate-900">Para todas as ocasiões</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {useCases.map((c) => (
            <span key={c} className="rounded-full bg-[#fef3c7] px-3 py-2 text-sm text-slate-900">
              {c}
            </span>
          ))}
        </div>
      </section>

      <section id="seguranca" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">Segurança & Confiança</p>
          <h2 className="text-2xl font-bold text-slate-900">Pensado para evitar fraudes e erros</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {trustPoints.map((point) => (
            <Card key={point} className="bg-white ring-1 ring-slate-200">
              <p className="text-sm text-slate-700">{point}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl bg-gradient-to-r from-white via-[#fff2ea] to-white p-6 ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Pronto para transformar Pix em presente?</h2>
        <p className="text-sm text-slate-700">
          Crie seu primeiro GiftPix agora. Seguro, rápido e com experiência de presente.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="#hero">
            <Button intent="primary" size="lg">
              Criar meu GiftPix agora
            </Button>
          </Link>
          <Link href="#como-funciona">
            <Button intent="secondary" size="lg">
              Ver como funciona
            </Button>
          </Link>
        </div>
      </section>

      <footer className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>GiftPix · 2025</span>
        <div className="flex gap-3">
          <a className="hover:underline" href="#">Termos de Uso</a>
          <a className="hover:underline" href="#">Política de Privacidade</a>
          <a className="hover:underline" href="#">Contato</a>
        </div>
      </footer>
    </main>
  );
}

function AuthPanel({
  sessionEmail,
  onSignIn,
  onSignUp,
  onSignOut,
  isLoading,
  error,
  onForgotPassword,
  name,
  onNameChange,
}: {
  sessionEmail: string | null;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string, name?: string) => void;
  onSignOut: () => void;
  isLoading: boolean;
  error: string | null;
  onForgotPassword: (email: string) => void;
  name: string;
  onNameChange: (name: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  if (sessionEmail) {
    return (
      <Card className="bg-white ring-1 ring-slate-200 text-slate-900">
        <p className="text-sm">Logado como {sessionEmail}</p>
        <Button intent="secondary" size="sm" className="mt-2" onClick={onSignOut}>
          Sair
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-white ring-1 ring-slate-200 text-slate-900">
      <div className="flex flex-col gap-2">
        {isRegister && (
          <input
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none"
            placeholder="nome completo"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        )}
        <input
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none"
          type="password"
          placeholder="senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            intent="primary"
            size="sm"
            onClick={() => (isRegister ? onSignUp(email, password, name) : onSignIn(email, password))}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : isRegister ? 'Criar conta' : 'Entrar'}
          </Button>
          <Button intent="secondary" size="sm" onClick={() => setIsRegister(!isRegister)} disabled={isLoading}>
            {isRegister ? 'Já tenho conta' : 'Quero registrar'}
          </Button>
        </div>
        {!isRegister && (
          <button
            type="button"
            className="text-left text-xs text-[var(--color-primary)] underline"
            onClick={() => onForgotPassword(email)}
            disabled={isLoading}
          >
            Esqueci minha senha
          </button>
        )}
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </Card>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-lg"
        >
          <span
            className={
              toast.type === 'success'
                ? 'text-emerald-500'
                : toast.type === 'error'
                ? 'text-rose-500'
                : 'text-[var(--color-primary)]'
            }
          >
            ●
          </span>
          <span className="leading-tight">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
