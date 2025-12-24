# Variáveis de Ambiente

Este arquivo lista todas as variáveis de ambiente necessárias para a aplicação.

## Variáveis Obrigatórias

### Configuração Básica
```env
NODE_ENV=production
PORT=3000
```

### Segurança
```env
API_SECRET_KEY=sua_chave_secreta_forte_aqui
```
**⚠️ IMPORTANTE**: Gere uma chave secreta forte:
```bash
openssl rand -hex 32
```

### Provedor de Pagamento

**Opção A: Asaas (Recomendado)**
```env
PAYMENT_PROVIDER=asaas
ASAAS_API_URL=https://www.asaas.com/api
ASAAS_API_KEY=sua_api_key_asaas_aqui
```

**Opção B: PagBank**
```env
PAYMENT_PROVIDER=pagbank
PAGBANK_API_URL=https://api.pagseguro.com
PAGBANK_API_TOKEN=seu_token_pagbank_aqui
PAGBANK_EMAIL=seu_email@pagseguro.com
```

## Variáveis Opcionais

### Limites de Transação
```env
MIN_PIX_VALUE=1.00
MAX_PIX_VALUE=10000.00
```

### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Logs
```env
LOG_LEVEL=info
```

### CORS (Produção)
```env
ALLOWED_ORIGINS=https://seu-frontend.com,https://www.seu-frontend.com,https://seu-app.onrender.com
```

## Exemplo Completo para Render

```env
# Server
NODE_ENV=production
PORT=10000

# Provider
PAYMENT_PROVIDER=asaas
ASAAS_API_URL=https://www.asaas.com/api
ASAAS_API_KEY=${{secrets.ASAAS_API_KEY}}

# Security
API_SECRET_KEY=${{secrets.API_SECRET_KEY}}

# Limits
MIN_PIX_VALUE=1.00
MAX_PIX_VALUE=10000.00

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info

# CORS
ALLOWED_ORIGINS=https://seu-frontend.com,https://seu-app.onrender.com
```

## Configuração no Render

1. Acesse o dashboard do seu serviço no Render
2. Vá em **Environment**
3. Adicione cada variável clicando em **Add Environment Variable**
4. Para valores sensíveis, use **Secret Files** ou **Environment Secrets**

## Validação

A aplicação validará as variáveis obrigatórias na inicialização. Se alguma estiver faltando, a aplicação não iniciará e mostrará um erro indicando qual variável está faltando.

