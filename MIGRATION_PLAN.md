# 🚀 Plano de Migração - GiftPix

## Estrutura do Projeto

### Opção Escolhida: **Monorepo** (1 repositório, 2 serviços no Render)

```
giftpix/
├── apps/
│   ├── frontend/          # Next.js + Tailwind
│   └── backend/           # NestJS + Prisma
├── packages/
│   └── shared/            # Tipos e utilitários compartilhados
├── docs/                  # Documentação
├── package.json           # Root (workspaces)
└── README.md
```

## Stack Tecnológica

| Camada | Tecnologia | Status |
|--------|-----------|--------|
| Frontend | Next.js 14 + Tailwind CSS | ⏳ A criar |
| Backend | NestJS + TypeScript | ⏳ A migrar |
| Banco | PostgreSQL | ⏳ A configurar |
| ORM | Prisma | ⏳ A configurar |
| Pix | Asaas / PagBank | ✅ Já implementado |
| Auth | JWT | ⏳ A implementar |
| QR Code | react-qr-code | ⏳ A implementar |
| Logs | Pino | ⏳ A migrar |
| Infra | Render (2 serviços) | ⏳ A configurar |

## Fases de Migração

### Fase 1: Estrutura Base ✅
- [x] Criar estrutura de monorepo
- [ ] Configurar workspaces no package.json root
- [ ] Configurar TypeScript para monorepo

### Fase 2: Backend (NestJS)
- [ ] Inicializar NestJS em `apps/backend`
- [ ] Migrar serviços existentes (Asaas, PagBank)
- [ ] Configurar Prisma
- [ ] Criar schema do banco (gifts, redemptions, payments, audit_logs)
- [ ] Implementar Gift Service
- [ ] Implementar Redemption Service
- [ ] Implementar sistema de PIN/código secreto
- [ ] Migrar autenticação para JWT
- [ ] Configurar logs com Pino

### Fase 3: Frontend (Next.js)
- [ ] Inicializar Next.js 14 em `apps/frontend`
- [ ] Configurar Tailwind CSS
- [ ] Criar landing page
- [ ] Criar página de criação de Gift
- [ ] Criar página de resgate (via QR Code)
- [ ] Integrar com API backend
- [ ] Implementar geração de QR Code

### Fase 4: Banco de Dados
- [ ] Configurar PostgreSQL (local e Render)
- [ ] Criar migrations com Prisma
- [ ] Migrar dados existentes (se houver)

### Fase 5: Deploy
- [ ] Configurar Render para backend (NestJS)
- [ ] Configurar Render para frontend (Next.js)
- [ ] Configurar variáveis de ambiente
- [ ] Configurar PostgreSQL no Render
- [ ] Testar deploy completo

## Diferenças do MVP Atual

### O que já temos:
- ✅ Integração com Asaas e PagBank
- ✅ Geração de QR Code
- ✅ Sistema de payouts PIX
- ✅ Validações básicas

### O que precisa ser adicionado:
- ⏳ Sistema de Gift (criação, resgate, status)
- ⏳ Código secreto (PIN) para resgate
- ⏳ Banco de dados persistente (PostgreSQL)
- ⏳ Frontend completo (Next.js)
- ⏳ Fluxo de pagamento para criar Gift
- ⏳ Validação de uso único
- ⏳ Expiração de gifts
- ⏳ Logs de auditoria

## Próximos Passos

1. **Criar estrutura de monorepo**
2. **Migrar backend para NestJS**
3. **Configurar Prisma e PostgreSQL**
4. **Criar frontend Next.js**
5. **Implementar fluxo completo de Gift**

## Notas Importantes

- Manter compatibilidade com código existente durante migração
- Testar cada fase antes de avançar
- Documentar todas as mudanças
- Configurar CI/CD para ambos os serviços

