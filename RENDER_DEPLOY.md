# Guia de Deploy no Render

Este guia explica como fazer o deploy da aplicação Gift PIX Payout no Render.

## Pré-requisitos

1. Conta no [Render](https://render.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Credenciais do provedor de pagamento (Asaas ou PagBank)

## Opção 1: Deploy via render.yaml (Recomendado)

### 1. Conectar Repositório

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Clique em **New +** > **Blueprint**
3. Conecte seu repositório Git
4. Render detectará automaticamente o arquivo `render.yaml`

### 2. Configurar Variáveis de Ambiente

No dashboard do Render, adicione as seguintes variáveis de ambiente:

#### Configuração Básica
```
NODE_ENV=production
PORT=10000
```

#### Provedor de Pagamento (escolha um)

**Opção A: Asaas**
```
PAYMENT_PROVIDER=asaas
ASAAS_API_URL=https://www.asaas.com/api
ASAAS_API_KEY=sua_api_key_aqui
```

**Opção B: PagBank**
```
PAYMENT_PROVIDER=pagbank
PAGBANK_API_URL=https://api.pagseguro.com
PAGBANK_API_TOKEN=seu_token_aqui
PAGBANK_EMAIL=seu_email@pagseguro.com
```

#### Segurança
```
API_SECRET_KEY=sua_chave_secreta_forte_aqui
```

**⚠️ IMPORTANTE**: Gere uma chave secreta forte:
```bash
openssl rand -hex 32
```

#### Limites e Configurações
```
MIN_PIX_VALUE=1.00
MAX_PIX_VALUE=10000.00
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 3. Deploy

O Render fará o deploy automaticamente após o push para o repositório.

## Opção 2: Deploy Manual via Dashboard

### 1. Criar Novo Web Service

1. Acesse [Dashboard do Render](https://dashboard.render.com)
2. Clique em **New +** > **Web Service**
3. Conecte seu repositório Git

### 2. Configurar Build

- **Environment**: `Node`
- **Build Command**: `yarn install` (ou `npm install`)
- **Start Command**: `yarn start` (ou `npm start`)
- **Root Directory**: (deixe em branco)

**Nota**: O script `start` já faz o build automaticamente antes de iniciar o servidor.

### 3. Configurar Health Check

- **Health Check Path**: `/api/health`

### 4. Adicionar Variáveis de Ambiente

Adicione todas as variáveis listadas na seção "Configurar Variáveis de Ambiente" acima.

### 5. Deploy

Clique em **Create Web Service** para iniciar o deploy.

## Configuração de CORS

Após o deploy, você receberá uma URL do Render (ex: `https://gift-pix-payout.onrender.com`).

Para permitir requisições do seu frontend, atualize o arquivo `src/app.ts`:

```typescript
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? [
        'https://seu-frontend.com',
        'https://www.seu-frontend.com',
        'https://gift-pix-payout.onrender.com' // URL do Render
      ]
    : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}));
```

Ou configure via variável de ambiente:

```
ALLOWED_ORIGINS=https://seu-frontend.com,https://www.seu-frontend.com
```

## Configuração de Webhooks

Se você estiver usando o Asaas, configure os webhooks para apontar para sua URL do Render:

1. **Webhook de Autorização**: 
   ```
   https://seu-app.onrender.com/api/webhooks/asaas/authorize
   ```

2. **Webhook de Notificação**:
   ```
   https://seu-app.onrender.com/api/webhooks/asaas/notification
   ```

### Configuração no Asaas

1. Acesse o dashboard do Asaas
2. Vá em **Configurações** > **Webhooks**
3. Adicione as URLs acima
4. Configure os eventos:
   - **Transfer.AUTHORIZE** → `/api/webhooks/asaas/authorize`
   - **Transfer.NOTIFICATION** → `/api/webhooks/asaas/notification`

## Verificação do Deploy

Após o deploy, teste os endpoints:

### Health Check
```bash
curl https://seu-app.onrender.com/api/health
```

### Teste de Autenticação
```bash
curl -H "x-api-key: sua_chave_secreta" \
  https://seu-app.onrender.com/api/health
```

### Teste de Payout
```bash
curl -X POST https://seu-app.onrender.com/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave_secreta" \
  -d '{
    "chave_pix": "teste@exemplo.com",
    "valor": 10.00,
    "descricao": "Teste de deploy"
  }'
```

## Troubleshooting

### Build Falha

1. Verifique se todas as dependências estão no `package.json`
2. Verifique os logs de build no dashboard do Render
3. Certifique-se de que o TypeScript está configurado corretamente

### Erro de Porta

O Render define automaticamente a variável `PORT`. Certifique-se de que o código usa `process.env.PORT` (já está configurado).

### Erro de Variáveis de Ambiente

1. Verifique se todas as variáveis obrigatórias estão configuradas
2. Verifique se não há espaços extras nos valores
3. Certifique-se de que as chaves estão corretas

### Aplicação não inicia

1. Verifique os logs no dashboard do Render
2. Certifique-se de que o comando `npm start` está correto
3. Verifique se o arquivo `dist/server.js` existe após o build

### Timeout no Health Check

1. Verifique se o endpoint `/api/health` está acessível
2. Aumente o timeout do health check no dashboard (padrão: 30s)

## Monitoramento

### Logs

Acesse os logs em tempo real no dashboard do Render:
- **Logs** > **Live Logs**

### Métricas

O Render fornece métricas básicas:
- CPU e memória
- Requisições por segundo
- Tempo de resposta

## Atualizações

Para atualizar a aplicação:

1. Faça push das alterações para o repositório
2. O Render detectará automaticamente e fará um novo deploy
3. Ou clique em **Manual Deploy** no dashboard

## Custos

- **Starter Plan**: Gratuito (com limitações)
  - Sleep após 15 minutos de inatividade
  - 750 horas/mês grátis
  
- **Standard Plan**: $7/mês
  - Sem sleep
  - Melhor performance

## Segurança em Produção

1. ✅ Use HTTPS (automático no Render)
2. ✅ Configure `API_SECRET_KEY` forte
3. ✅ Use variáveis de ambiente (nunca commite `.env`)
4. ✅ Configure CORS adequadamente
5. ✅ Monitore os logs regularmente
6. ✅ Use rate limiting (já configurado)
7. ✅ Valide webhooks do Asaas (implementar verificação de IP/assinatura)

## Próximos Passos

Após o deploy bem-sucedido:

1. Configure um domínio customizado (opcional)
2. Configure alertas de monitoramento
3. Configure backups (se usar banco de dados)
4. Implemente CI/CD para deploys automáticos

## Suporte

- [Documentação Render](https://render.com/docs)
- [Status do Render](https://status.render.com)
- [Suporte Render](https://render.com/support)

