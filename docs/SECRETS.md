# Gestão de Secrets e Acesso

## Backend (API)
- **Chave da API**: `API_SECRET_KEY` (ou `GIFTPIX_API_KEY` para proxies). Usada no header `x-api-key` pelos clientes internos (frontend proxy). Não exponha ao navegador.
- **Supabase / DB**: use service role e URLs do banco:
  - `DB_PROVIDER=supabase`
  - `SUPABASE_DATABASE_URL=postgresql://postgres:<senha>@db.<hash>.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10&sslmode=require`
  - `SUPABASE_DIRECT_URL=postgresql://postgres:<senha>@db.<hash>.supabase.co:5432/postgres?sslmode=require`
- **Providers**:
  - Asaas: `ASAAS_API_URL`, `ASAAS_API_KEY`
  - PagBank: `PAGBANK_API_URL`, `PAGBANK_API_TOKEN`, `PAGBANK_EMAIL`
- **RLS Supabase**: políticas permitem apenas `service_role`; não use `anon` no backend.

## Frontend (Next.js)
- Supabase Auth client-side: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pode ficar no `.env` do app web; nunca use service role no frontend).
- Proxy para API: `GIFTPIX_API_URL` (ex.: `http://localhost:3003/api`) e `GIFTPIX_API_KEY` configurados apenas no servidor (variáveis do Next em runtime no lado server). Não expor no cliente.

## Boas práticas
- Não commitar `.env`; usar `.env.example` e secrets no provedor (Render).
- Rotacionar `API_SECRET_KEY`/provider keys ao trocar ambientes.
- Validar que `PORT`, `NODE_ENV=production` e CORS estão configurados em produção.
- Logs: não registrar PIN ou chaves sensíveis.

## Deploy (Render)
- Configure secrets no dashboard: DB URLs, `API_SECRET_KEY`, providers, `GIFTPIX_API_KEY`.
- Build já roda `prisma:generate` e `build` via `render.yaml`.
