# Webhook de Autorização de Transferências - Asaas

Este guia explica como configurar e usar o mecanismo de autorização de transferências via webhook do Asaas.

## O que é?

O webhook de autorização permite que **você aprove ou negue transferências** antes que o Asaas as processe. Isso adiciona uma camada extra de segurança e controle.

## Como Funciona

```
1. Usuário solicita transferência PIX
2. Asaas envia webhook para seu servidor
3. Seu servidor valida e responde (autorizado: sim/não)
4. Asaas processa ou cancela baseado na resposta
```

## Implementação

### 1. Endpoints Criados

#### **Autorização de Transferência**
```
POST /api/webhooks/asaas/authorize
```

**Webhook que o Asaas envia ANTES de processar a transferência**

**Exemplo de payload recebido:**
```json
{
  "event": "TRANSFER_AUTHORIZATION_REQUESTED",
  "transfer": {
    "id": "tra_123456",
    "value": 100.00,
    "pixAddressKey": "exemplo@exemplo.com",
    "pixAddressKeyType": "EMAIL",
    "description": "Pagamento teste"
  }
}
```

**Sua resposta (aprovar):**
```json
{
  "authorized": true
}
```

**Sua resposta (negar):**
```json
{
  "authorized": false,
  "denialReason": "Valor acima do limite permitido"
}
```

#### **Notificação de Status**
```
POST /api/webhooks/asaas/notification
```

**Webhook que o Asaas envia quando o status da transferência muda**

### 2. Validações Implementadas

A implementação atual valida:

✅ **Valor mínimo**: R$ 1,00
✅ **Valor máximo**: R$ 1.000,00
✅ **Lista negra de chaves PIX**
✅ **Limite diário** (exemplo comentado)
✅ **Horário comercial** (exemplo comentado)

### 3. Customizar Validações

Edite o arquivo [src/controllers/webhookController.ts](src/controllers/webhookController.ts):

```typescript
// Adicionar validação customizada
if (value > 500.00 && !isVerifiedCustomer(pixAddressKey)) {
  authorized = false;
  denialReason = 'Transferências acima de R$ 500 requerem verificação';
}
```

## Configurar no Asaas

### Passo 1: Acessar Configurações

1. Acesse o painel Asaas: https://www.asaas.com (ou sandbox)
2. Vá em **Integrações** > **Webhooks**
3. Clique em **Adicionar Webhook**

### Passo 2: Configurar URL de Autorização

**Ambiente de Desenvolvimento:**
```
URL: http://seu-servidor:3000/api/webhooks/asaas/authorize
```

**Produção (com HTTPS):**
```
URL: https://seu-dominio.com/api/webhooks/asaas/authorize
```

### Passo 3: Selecionar Evento

Selecione:
- ✅ **TRANSFER_AUTHORIZATION_REQUESTED**

### Passo 4: Configurar URL de Notificação

Adicione outro webhook para notificações:

```
URL: https://seu-dominio.com/api/webhooks/asaas/notification
```

Eventos:
- ✅ **TRANSFER_CREATED**
- ✅ **TRANSFER_UPDATED**
- ✅ **TRANSFER_STATUS_UPDATED**

## Testar Localmente

### 1. Expor seu servidor local

Use **ngrok** para expor seu localhost:

```bash
# Instalar ngrok
brew install ngrok

# Expor porta 3000
ngrok http 3000
```

Você receberá uma URL como: `https://abc123.ngrok.io`

### 2. Configurar no Asaas

Use a URL do ngrok:
```
https://abc123.ngrok.io/api/webhooks/asaas/authorize
```

### 3. Testar Transferência

```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "teste@teste.com",
    "valor": 10.00,
    "descricao": "Teste webhook"
  }'
```

### 4. Verificar Logs

```bash
tail -f logs/combined.log
```

Você verá:
```
Asaas authorization webhook received
Transfer authorization decision: authorized=true
```

## Exemplos de Validação

### Limite por Horário

```typescript
const now = new Date();
const hour = now.getHours();

if (hour < 8 || hour > 18) {
  authorized = false;
  denialReason = 'Transferências permitidas apenas das 8h às 18h';
}
```

### Limite Diário

```typescript
const dailyTotal = await this.getDailyTotal();

if (dailyTotal + value > 5000.00) {
  authorized = false;
  denialReason = `Limite diário de R$ 5.000,00 excedido. Total hoje: R$ ${dailyTotal.toFixed(2)}`;
}
```

### Lista Branca de Destinatários

```typescript
const whitelist = [
  'fornecedor@empresa.com',
  'parceiro@exemplo.com'
];

if (!whitelist.includes(pixAddressKey)) {
  authorized = false;
  denialReason = 'Destinatário não autorizado';
}
```

### Verificação de Fraude

```typescript
// Verificar se há muitas transferências para a mesma chave
const recentTransfers = await this.getRecentTransfersByPixKey(pixAddressKey);

if (recentTransfers.length > 3) {
  authorized = false;
  denialReason = 'Múltiplas transferências recentes para este destinatário';
}
```

### Valor Progressivo

```typescript
// Limites crescem com o tempo de conta
const accountAge = await this.getAccountAgeDays();

let maxValue = 100.00; // Padrão
if (accountAge > 30) maxValue = 500.00;
if (accountAge > 90) maxValue = 1000.00;

if (value > maxValue) {
  authorized = false;
  denialReason = `Valor máximo permitido: R$ ${maxValue.toFixed(2)}`;
}
```

## Segurança do Webhook

### 1. Validar IP do Asaas (Recomendado)

Adicione middleware para validar IPs do Asaas:

```typescript
// src/middlewares/validateAsaasWebhook.ts
import { Request, Response, NextFunction } from 'express';

const ASAAS_IPS = [
  '54.94.206.175',
  '52.67.124.80',
  // Adicione IPs oficiais do Asaas
];

export const validateAsaasWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientIp = req.ip || req.connection.remoteAddress;

  if (!ASAAS_IPS.includes(clientIp)) {
    logger.warn('Webhook from unauthorized IP', { ip: clientIp });
    res.status(403).json({ error: 'Unauthorized' });
    return;
  }

  next();
};
```

### 2. Validar Assinatura (Se Asaas suportar)

Verifique a documentação do Asaas para assinaturas de webhook.

### 3. Rate Limiting

Proteja contra spam:

```typescript
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 60000, // 1 minuto
  max: 100, // 100 requisições
});

router.post('/webhooks/asaas/authorize', webhookLimiter, ...);
```

## Logs e Monitoramento

### Ver Logs de Webhooks

```bash
# Filtrar apenas webhooks
grep "webhook" logs/combined.log

# Ver decisões de autorização
grep "authorization decision" logs/combined.log
```

### Métricas Importantes

- **Taxa de aprovação**: Quantas transferências são aprovadas
- **Razões de negação**: Por que transferências são negadas
- **Tempo de resposta**: Seu servidor deve responder rápido (<2s)

## Troubleshooting

### Webhook não está sendo chamado

1. **Verifique a URL** no painel Asaas
2. **Teste com ngrok** se estiver local
3. **Verifique se a URL é acessível** publicamente
4. **Veja logs do Asaas** no painel

### Transferências sendo negadas

1. **Verifique os logs**:
   ```bash
   grep "authorization decision" logs/combined.log
   ```
2. **Veja o denialReason** nos logs
3. **Ajuste as validações** conforme necessário

### Timeout

Se o webhook demorar mais de 5 segundos:
- Asaas pode aprovar automaticamente (comportamento padrão)
- Otimize suas validações
- Use cache para verificações rápidas

## Produção

### Checklist

- [ ] Configurei URL HTTPS do webhook
- [ ] Validação de IP do Asaas implementada
- [ ] Rate limiting configurado
- [ ] Logs e monitoramento ativos
- [ ] Testei todos os cenários de validação
- [ ] Alertas configurados para falhas

### Configuração de Produção

```env
NODE_ENV=production
ASAAS_API_URL=https://api.asaas.com
ASAAS_API_KEY=$aact_prod_...
```

No painel Asaas (produção):
```
URL: https://seu-dominio.com/api/webhooks/asaas/authorize
```

## Documentação Asaas

- **Webhooks**: https://docs.asaas.com/docs/webhooks
- **Autorização de Saques**: https://docs.asaas.com/docs/mecanismo-para-validacao-de-saque-via-webhooks

## Exemplo Completo

```typescript
// Validação completa customizada
async authorizeTransfer(req: Request, res: Response): Promise<void> {
  const { transfer } = req.body;
  const { value, pixAddressKey } = transfer;

  let authorized = true;
  let denialReason = '';

  // 1. Valor
  if (value < 1 || value > 1000) {
    authorized = false;
    denialReason = 'Valor fora dos limites';
  }

  // 2. Horário
  const hour = new Date().getHours();
  if (hour < 8 || hour > 18) {
    authorized = false;
    denialReason = 'Fora do horário permitido';
  }

  // 3. Lista negra
  const blacklist = ['spam@test.com'];
  if (blacklist.includes(pixAddressKey)) {
    authorized = false;
    denialReason = 'Destinatário bloqueado';
  }

  // 4. Limite diário
  const dailyTotal = await this.getDailyTotal();
  if (dailyTotal + value > 5000) {
    authorized = false;
    denialReason = 'Limite diário excedido';
  }

  res.json({ authorized, denialReason });
}
```

---

**Pronto!** Agora você tem controle total sobre as transferências antes que sejam processadas. 🚀

**Próximos passos**: Configure o webhook no painel do Asaas e teste!
