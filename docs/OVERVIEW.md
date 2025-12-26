# GiftPix — Visão Geral

Documentação única do projeto em monorepo.

## Stack e Estrutura
- Monorepo npm workspaces.
- Backend: Express + Prisma + Supabase Postgres (`apps/api`).
- Frontend: Next.js App Router + Tailwind (`apps/web`).
- Infra: Prisma client em `packages/infra`.
- Docs de features em `docs/features/`.

## Configuração Rápida
1) Copiar `.env.example` para `.env` na raiz e preencher:
   - `API_SECRET_KEY`, `GIFTPIX_API_URL` (para o front), provedores Pix (Asaas/PagBank), Supabase URLs/keys.
   - Flag de pagamento: `REQUIRE_PAYMENT_CONFIRMATION`.
   - Notificações: `NOTIFICATION_DEFAULT_RECIPIENT`.
   - `FRONTEND_BASE_URL` para QR/links.
2) Migrações:
   ```bash
   npm run prisma:migrate --workspace @giftpix/infra
   ```
   Inclui tabelas de gift, pagamentos, antifraude, notificações, histórico, etc.
3) Rodar:
   ```bash
   npm run dev:api
   npm run dev:web
   ```

## Principais Features
- **Autenticação Supabase**: login/signup/reset, redireciona para dashboard; cookies ainda não HttpOnly (melhoria futura).
- **Landing**: CTA criar, seções como funciona/benefícios/casos/segurança, tema claro vermelho+dourado.
- **Dashboard (/dashboard)**: cards de resumo, lista de gifts, links para detalhes, criação, histórico.
- **Criação de Gift (/create)**: fluxo em 4 passos (valor, mensagem, revisão, geração), PIN salvo localmente, link `/redeem?ref=...`.
- **Detalhes (/dashboard/gifts/[ref])**: status de gift+Pix, QR/link, referência copiável.
- **Resgate (/redeem)**: multi-step (boas-vindas → PIN → chave Pix → confirmação → resultado), mostra processamento/falha/estorno.
- **Histórico (/history)**: protegido, filtros status/período, resumo financeiro, lista com status gift/Pix, link para detalhes.
- **Perfil (/profile)**: dados básicos, preferências de notificação, troca de senha, logout, soft delete.
- **Antifraude**: limites de criação/resgate, registros `fraud_event`, bloqueios `fraud_block`; regras simples por IP/tentativas; configs via `system_config`.
- **Notificações**: placeholders de e-mail (log) para criado/resgatado; tabela `notification`.
- **Status Pix**: consulta PSP sempre que há `provider_ref`; mapeia pending/processing/completed/failed/refunded e atualiza gift.
- **Refund/Config**: `system_config` contém `refund_days_not_redeemed` (ainda não automatizado).

## API (apps/api)
Todas exigem `x-api-key` (`API_SECRET_KEY`).
- Health: `GET /api/health`.
- Gifts:
  - `POST /api/gifts` cria (amount, message, pin...).
  - `POST /api/gifts/:referenceId/redeem` resgata (pin, pix_key).
  - `GET /api/gifts/:referenceId` status (consulta PSP).
  - `POST /api/gifts/:referenceId/validate-code` valida PIN.
  - `GET /api/gifts` lista; `GET /api/gifts/summary`.
  - `GET /api/gifts/:referenceId/qrcode` retorna dataURL.
- Payouts/PIX: `POST /api/pix-payout`, `GET /api/pix-payout/:referenceId`, `GET /api/pix-payout`.
- History: `GET /api/history`, `GET /api/history/summary`.
- QR Code: `POST /api/qrcode/generate`, `GET /api/qrcode/image`.
- Webhooks Asaas: `/api/webhooks/asaas/...` (autorizar/notification).

## Front (apps/web)
- APIs proxy em `/app/api/...` chamam backend com `GIFTPIX_API_KEY`.
- Rotas principais: `/` (landing), `/create`, `/dashboard`, `/dashboard/gifts/[ref]`, `/redeem?ref=...`, `/history`, `/profile`, `/r/[ref]` (redirect curto).
- Estilo: tema claro, primário vermelho, dourado para destaques, cartões brancos com borda/sombra leve.

## Dados e Tabelas (resumo)
- `gift`, `gift_redemption`, `payment` (status Pix), `pix_transaction` (estrutura para tracking PSP), `notification`, `fraud_event`, `fraud_block`, `system_config`, `transaction_log`, `audit_log`.

## Scripts Úteis
- Lint: `npm run lint --workspaces`
- Migração: `npm run prisma:migrate --workspace @giftpix/infra`
- Dev: `npm run dev:api` e `npm run dev:web`

## Gaps e Próximos Passos
- Sessão com cookies HttpOnly para reforçar segurança.
- Automatizar estorno/refund e usar `pix_transaction` + jobs/webhooks.
- Integrar provedor real de e-mail nas notificações.
- Aplicar tema claro nas demais telas já feito; manter consistência.

