# 🔐 Feature — Login & Cadastro (GiftPix)

**Status:** Planned (MVP)  
**Stack alvo:** Supabase Auth + API Proxy (Next.js) + Prisma (users)  
**Público:** Sender (quem cria gifts). Recipient não precisa login.

---

## 1) Objetivo
Permitir que usuários criem conta e façam login com baixo atrito para criar/gerenciar gifts. Destinatário resgata sem login.

## 2) Escopo (MVP)
### Dentro
- Cadastro e login por e-mail/senha.
- Recuperação de senha.
- Sessão autenticada (Supabase Auth client) e proteção da camada de criação de gifts.
- Validação básica de senha.
- Estado de usuário ativo/pending.

### Fora (MVP)
- Login social, 2FA, KYC, biometria.

## 3) Fluxos
### Cadastro
- Campos: nome, e-mail, senha, confirmar senha.
- Regras: e-mail único, senha mínima 8 chars, 1 letra, 1 número. Aceite de termos.
- Estado: `PENDING_VERIFICATION` → e-mail de verificação Supabase → `ACTIVE`.
- Endpoint (proxy): `POST /api/auth/signup` → Supabase Auth.

### Login
- Campos: e-mail, senha.
- Regras: status ativo, bloqueio temporário após tentativas (via Supabase throttling).
- Endpoint: `POST /api/auth/login`.

### Sessão
- Supabase Auth (JWT curta duração + refresh gerenciado pelo client).
- Front controla UI: criar gift exige sessão; resgate não exige.

### Recuperação de senha
- Fluxo Supabase: magic link/reset password via e-mail.
- Endpoints: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` (ou usar UI hosted Supabase).

## 4) Dados (Prisma - tabela users)
`users(id uuid pk, name text, email text unique, password_hash text?, status enum('PENDING','ACTIVE','BLOCKED'), created_at, updated_at)`

Notas:
- Com Supabase Auth, a senha fica no Supabase. A tabela `users` local pode armazenar perfil (name, status, terms_at).
- Status sincronizado com `auth.users` (campo `user_metadata.status`).

## 5) APIs (proxy Next)
- `POST /api/auth/signup` -> chama Supabase Auth signUp.
- `POST /api/auth/login` -> signInWithPassword.
- `POST /api/auth/logout` -> signOut.
- `POST /api/auth/forgot-password` -> send reset email.
- `POST /api/auth/reset-password` -> Supabase handles via link; opcional endpoint para update.

## 6) UI/UX
- Painel superior com login/cadastro e troca para “Criar conta”.
- Validação inline: senha fraca, e-mail inválido, confirma senha.
- Feedback de sucesso/erro via toasts.
- Desabilitar botões enquanto processa.
- Recipients: ver apenas resgate (sem login), mostrar mensagem do gift ou fallback “Parabéns!”.

## 7) Segurança
- Nunca expor service role no frontend; usar `NEXT_PUBLIC_SUPABASE_ANON_KEY` somente.
- Backend usa service role para DB/Prisma; endpoints de gift protegidos por `x-api-key`.
- Rate limit em auth endpoints (Supabase e/ou edge functions).
- Logs sem armazenar senha; não logar PIN.

## 8) Requisitos não funcionais
- Hash forte (Supabase/BCrypt), tokens expiram, logs de login, LGPD (consentimento).
- CORS configurado; HTTPS obrigatório em produção.

## 9) Testes
- Integração: signup -> login -> criar gift (espera 200).
- Fluxo de reset: request reset -> link (mock) -> nova senha -> login.

## 10) Futuro
- 2FA, login social, KYC, planos B2B, dashboard de organização.
