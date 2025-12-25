# 🏗️ Arquitetura GiftPix - Monorepo

## Estrutura do Projeto

```
giftpix/
├── apps/
│   ├── frontend/              # Next.js 14 + Tailwind
│   │   ├── src/
│   │   │   ├── app/           # App Router (Next.js 14)
│   │   │   ├── components/    # Componentes React
│   │   │   └── lib/           # Utilitários
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── backend/                # NestJS
│       ├── src/
│       │   ├── modules/
│       │   │   ├── gifts/     # Gift Service
│       │   │   ├── payments/  # Payment Service
│       │   │   ├── redemptions/ # Redemption Service
│       │   │   └── pix/       # Pix Integration (Asaas/PagBank)
│       │   ├── common/        # Guards, Interceptors, etc
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── package.json
│       └── nest-cli.json
│
├── packages/
│   └── shared/                 # Código compartilhado
│       ├── types/              # Types compartilhados
│       └── utils/              # Utilitários
│
├── docs/                        # Documentação
├── package.json                 # Root (workspaces)
├── pnpm-workspace.yaml          # ou yarn/npm workspaces
└── README.md
```

## Deploy no Render

### Backend (NestJS)
- **Tipo**: Web Service
- **Build Command**: `cd apps/backend && npm install && npm run build`
- **Start Command**: `cd apps/backend && npm run start:prod`
- **Root Directory**: `apps/backend`
- **Environment**: Node
- **Database**: PostgreSQL (Render PostgreSQL ou externo)

### Frontend (Next.js)
- **Tipo**: Web Service
- **Build Command**: `cd apps/frontend && npm install && npm run build`
- **Start Command**: `cd apps/frontend && npm run start`
- **Root Directory**: `apps/frontend`
- **Environment**: Node

## Fluxo de Dados

```
Usuário → Frontend (Next.js) → Backend (NestJS) → PostgreSQL
                                      ↓
                                 PSP (Asaas/PagBank)
```

## Variáveis de Ambiente

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret para JWT
- `ASAAS_API_KEY` / `PAGBANK_API_TOKEN` - Credenciais PSP
- `NODE_ENV` - production/development

### Frontend
- `NEXT_PUBLIC_API_URL` - URL do backend
- `NEXT_PUBLIC_APP_URL` - URL do frontend

## Próximos Passos

1. ✅ Criar estrutura de diretórios
2. ⏳ Configurar workspaces
3. ⏳ Inicializar NestJS
4. ⏳ Inicializar Next.js
5. ⏳ Configurar Prisma
6. ⏳ Migrar código existente

