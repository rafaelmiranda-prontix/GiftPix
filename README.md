# GiftPix - Gifts via Pix (Monorepo)

Backend/Frontend para criar e resgatar gifts liquidados via Pix usando provedores Asaas ou PagBank. Persistência com Prisma + Supabase (RLS service_role), monorepo npm workspaces (apps/api, apps/web, packages/*).

## Funcionalidades
- 🎁 Criar Gift com PIN, valor e mensagem.
- 🔓 Resgatar Gift com PIN + chave Pix, liquidando via provider.
- 🔀 Multi-provider: Asaas ou PagBank (`PAYMENT_PROVIDER`).
- 🧾 Transações/logs persistidos em Supabase (Prisma).
- 🔒 RLS habilitado (políticas service_role-only) e API Key.
- 🛡️ Helmet, CORS, rate limiting; QR Code legado ainda disponível.
- 🧭 Frontend Next.js + design system Tailwind (@giftpix/ui).

## Estrutura
```
apps/
  api/   # Express + Prisma
  web/   # Next.js + Tailwind
packages/
  infra/    # Prisma schema/client e helpers de DB
  shared/   # Tipos compartilhados
  ui/       # Design system Tailwind (CVA)
  utils/    # Helpers genéricos
```

## Setup rápido
```bash
npm install
# Prisma client
npm run prisma:generate --workspace @giftpix/infra
# Migrations (Supabase com RLS)
DIRECT_URL=$SUPABASE_DIRECT_URL DATABASE_URL=$SUPABASE_DATABASE_URL \
  npm run prisma:migrate --workspace @giftpix/infra -- --name <nome>
```

### Variáveis principais (.env na raiz)
- `PORT` (ex.: 3003)
- `PAYMENT_PROVIDER=asaas|pagbank`
- Asaas: `ASAAS_API_URL`, `ASAAS_API_KEY`
- PagBank: `PAGBANK_API_URL`, `PAGBANK_API_TOKEN`, `PAGBANK_EMAIL`
- Supabase/Postgres: `DB_PROVIDER=supabase`, `SUPABASE_DATABASE_URL`, `SUPABASE_DIRECT_URL`
- Segurança/limites: `API_SECRET_KEY`, `MIN_PIX_VALUE`, `MAX_PIX_VALUE`, rate limit, `LOG_LEVEL`

RLS: políticas service_role-only já aplicadas (ver `migrations/rls.sql`).

## Comandos
- Dev API: `npm run dev:api` (usa PORT do .env)
- Dev Web: `npm run dev:web`
- Build: `npm run build`
- Lint: `npm run lint`

## Endpoints (API, requer `x-api-key`)
- `GET /api/health`

### Gifts
- `POST /api/gifts`
  - body: `{ "amount": number, "pin": "string", "message"?: string, "expires_at"?: iso8601, "description"?: string, "provider"?: "asaas"|"pagbank" }`
  - retorna gift e pin informado (não armazenamos o PIN em claro)
- `POST /api/gifts/:referenceId/redeem`
  - body: `{ "pin": "string", "pix_key": "string, CPF/CNPJ/email/phone/EVP", "description"?: string }`
  - valida PIN, cria redemption, chama provider, atualiza status/payment/log
- `GET /api/gifts/:referenceId`
  - status do gift

### Legado (payout direto)
- `POST /api/pix-payout` (deprecated)
- `GET /api/pix-payout/:referenceId` (deprecated)
- `GET /api/pix-payout` (deprecated)

## Notas de segurança
- Use service role para Prisma/Supabase (não exponha `anon` no backend).
- PIN é armazenado como hash (sha256); não logue PINs.
- RLS ativa com políticas que permitem apenas service_role (ver `migrations/rls.sql`).
- API Key obrigatória nos endpoints (exceto health).

## Deploy
- Render: `render.yaml` usa npm e workspace `@giftpix/api`; start: `node apps/api/dist/server.js`.
- Garanta envs: DB URLs (Supabase), providers, `API_SECRET_KEY`, `PORT` (ou deixe Render injetar), API keys.
- Prisma: `npm run prisma:generate --workspace @giftpix/infra` e `npm run build --workspace @giftpix/api` já estão no buildCommand do Render.
- Segurança: veja `docs/SECRETS.md` (uso de service role no backend, RLS ativa, API keys e proxies do frontend).
