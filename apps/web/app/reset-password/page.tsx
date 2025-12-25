'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button, Card, Input } from '@giftpix/ui';

const parseHash = (hash: string) => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    access_token: params.get('access_token') || undefined,
    refresh_token: params.get('refresh_token') || undefined,
    type: params.get('type') || undefined,
  };
};

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { access_token, refresh_token } = parseHash(window.location.hash);
    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .catch(() => setError('Não foi possível validar o link de recuperação.'));
    }
  }, []);

  const handleReset = async () => {
    if (!password || password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Senhas não conferem.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setStatus(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
    } else {
      setStatus('Senha atualizada com sucesso. Você já pode entrar.');
    }
    setIsLoading(false);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Card className="bg-white shadow-lg">
        <h1 className="text-xl font-semibold text-slate-900">Redefinir senha</h1>
        <p className="mt-1 text-sm text-slate-600">
          Defina uma nova senha para a sua conta GiftPix.
        </p>
        <div className="mt-4 space-y-3">
          <Input
            label="Nova senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button intent="primary" size="md" onClick={handleReset} disabled={isLoading}>
            {isLoading ? 'Atualizando...' : 'Atualizar senha'}
          </Button>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          {status && <p className="text-sm text-emerald-600">{status}</p>}
        </div>
      </Card>
    </main>
  );
}
