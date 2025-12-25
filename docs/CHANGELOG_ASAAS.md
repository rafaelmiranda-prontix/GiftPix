# Changelog - Integração Asaas

Registro de alterações realizadas para adicionar suporte ao Asaas como provedor de pagamento PIX.

## Data: 24/12/2024

### ✅ Adicionado

#### 1. **Suporte Multi-Provider**
- ✅ Arquitetura abstrata que permite alternar entre provedores
- ✅ Interface `PaymentProvider` para padronização
- ✅ Factory pattern para gerenciar provedores

**Arquivos:**
- [`src/types/index.ts`](src/types/index.ts) - Interfaces `PaymentProvider` e `ProviderTransferResponse`
- [`src/services/providerFactory.ts`](src/services/providerFactory.ts) - Factory para selecionar provider

#### 2. **Serviço Asaas**
- ✅ Implementação completa da API Asaas
- ✅ Detecção automática de tipo de chave PIX
- ✅ Mapeamento de status para formato padrão
- ✅ Tratamento de erros específico

**Arquivo:**
- [`src/services/asaasService.ts`](src/services/asaasService.ts) - Service completo do Asaas

#### 3. **Atualização do Serviço PagBank**
- ✅ Implementa interface `PaymentProvider`
- ✅ Normalização de respostas
- ✅ Compatibilidade com arquitetura multi-provider

**Arquivo:**
- [`src/services/pagbankService.ts`](src/services/pagbankService.ts) - Service atualizado

#### 4. **Controller Atualizado**
- ✅ Usa `providerFactory` ao invés de service específico
- ✅ Armazena informação do provider usado na transação
- ✅ Consulta status usando provider correto

**Arquivo:**
- [`src/controllers/pixPayoutController.ts`](src/controllers/pixPayoutController.ts)

#### 5. **Configuração de Ambiente**
- ✅ Variável `PAYMENT_PROVIDER` para selecionar provider
- ✅ Configurações específicas para Asaas
- ✅ Suporte a ambos os providers simultaneamente

**Arquivos:**
- [`src/config/env.ts`](src/config/env.ts) - Configuração atualizada
- [`.env`](.env) - Arquivo de ambiente
- [`.env.example`](.env.example) - Template atualizado

#### 6. **Tipos e Interfaces**
- ✅ `AsaasTransferRequest` - Requisição Asaas
- ✅ `AsaasTransferResponse` - Resposta Asaas
- ✅ `PaymentProvider` - Interface de provider
- ✅ `ProviderTransferResponse` - Resposta padronizada
- ✅ Atualização de `TransactionLog` para incluir provider

**Arquivo:**
- [`src/types/index.ts`](src/types/index.ts)

#### 7. **Documentação**
- ✅ [ASAAS_SETUP.md](ASAAS_SETUP.md) - Guia completo de configuração Asaas
- ✅ [PROVIDER_COMPARISON.md](PROVIDER_COMPARISON.md) - Comparação Asaas vs PagBank
- ✅ [README.md](README.md) atualizado com multi-provider
- ✅ Este arquivo de changelog

---

## Mudanças Detalhadas

### Interface PaymentProvider

```typescript
export interface PaymentProvider {
  createPixTransfer(data: {
    pix_key: string;
    amount: number;
    description?: string;
    reference_id?: string;
  }): Promise<ProviderTransferResponse>;

  getTransferStatus(transferId: string): Promise<ProviderTransferResponse>;
}
```

### Resposta Padronizada

```typescript
export interface ProviderTransferResponse {
  id: string;
  reference_id?: string;
  status: string; // 'pending' | 'completed' | 'failed'
  amount: number;
  created_at: string;
  pix_key: string;
  description?: string;
}
```

### Seleção de Provider

O provider é selecionado via variável de ambiente:

```env
PAYMENT_PROVIDER=asaas  # ou 'pagbank'
```

### TransactionLog Atualizado

```typescript
export interface TransactionLog {
  // ... campos existentes
  provider_transaction_id?: string;  // Antes: pagbank_transaction_id
  provider: 'asaas' | 'pagbank';      // NOVO: identifica o provider
}
```

---

## Como Usar

### Configurar Provider

1. Edite `.env`:
   ```env
   PAYMENT_PROVIDER=asaas
   ASAAS_API_KEY=sua_api_key
   ```

2. Reinicie a aplicação:
   ```bash
   npm run dev
   ```

### Trocar de Provider

Simples! Apenas mude no `.env`:

```bash
# Antes (PagBank)
PAYMENT_PROVIDER=pagbank

# Depois (Asaas)
PAYMENT_PROVIDER=asaas
```

Reinicie a aplicação.

---

## Retrocompatibilidade

✅ **100% Compatível**

- APIs públicas não mudaram
- Formato de requisição mantido
- Formato de resposta mantido (com adição do campo `provider`)
- Transações existentes continuam funcionando

### Mudanças na Resposta da API

**Antes:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "pagbank_transaction_id": "123"
    }
  }
}
```

**Agora:**
```json
{
  "success": true,
  "data": {
    "provider": "asaas",
    "transaction": {
      "provider_transaction_id": "123"
    }
  }
}
```

---

## Testes

### Testar com Asaas

```bash
# Configure
export PAYMENT_PROVIDER=asaas
export ASAAS_API_KEY=sua_key

# Teste
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave" \
  -d '{"chave_pix":"teste@teste.com","valor":10}'
```

### Testar com PagBank

```bash
# Configure
export PAYMENT_PROVIDER=pagbank
export PAGBANK_API_TOKEN=seu_token

# Teste
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave" \
  -d '{"chave_pix":"teste@teste.com","valor":10}'
```

---

## Arquivos Modificados

### Core
- `src/types/index.ts` - Novas interfaces
- `src/config/env.ts` - Config de provider
- `src/controllers/pixPayoutController.ts` - Usa factory
- `src/services/pagbankService.ts` - Implementa interface

### Novos Arquivos
- `src/services/asaasService.ts` - Service Asaas
- `src/services/providerFactory.ts` - Factory pattern

### Configuração
- `.env` - Adicionado Asaas
- `.env.example` - Template atualizado

### Documentação
- `README.md` - Multi-provider
- `ASAAS_SETUP.md` - NOVO
- `PROVIDER_COMPARISON.md` - NOVO
- `CHANGELOG_ASAAS.md` - NOVO (este arquivo)

---

## Estatísticas

- **Arquivos TypeScript**: 16
- **Arquivos criados**: 3
- **Arquivos modificados**: 6
- **Linhas de código adicionadas**: ~800
- **Testes**: Manual (sandbox)

---

## Próximos Passos

### Melhorias Futuras

- [ ] Adicionar testes automatizados
- [ ] Implementar webhook do Asaas
- [ ] Adicionar mais provedores (Stripe, Pagar.me)
- [ ] Dashboard para monitorar transações por provider
- [ ] Métricas de performance por provider
- [ ] Fallback automático entre providers

### Migrações

- [ ] Script de migração de dados antigos
- [ ] Atualizar `pagbank_transaction_id` para `provider_transaction_id`

---

## Recursos

### Documentação Asaas
- **Portal**: https://docs.asaas.com
- **API Transferências**: https://docs.asaas.com/reference/transferir-para-conta-de-outra-instituicao-ou-chave-pix
- **Guia Projeto**: [ASAAS_SETUP.md](ASAAS_SETUP.md)

### Documentação Projeto
- **README**: [README.md](README.md)
- **Comparação**: [PROVIDER_COMPARISON.md](PROVIDER_COMPARISON.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Exemplos**: [EXEMPLOS.md](EXEMPLOS.md)

---

## Observações

### Por que Asaas?

1. ✅ API mais moderna e simples
2. ✅ Documentação superior
3. ✅ Recursos avançados (PIX Recorrente)
4. ✅ Melhor experiência de desenvolvedor
5. ✅ Webhooks nativos

### Mercado Pago?

❌ **Não suporta payouts PIX via API**

O Mercado Pago oferece apenas:
- Recebimento de pagamentos PIX (money-in)
- Gateway de pagamento

Para payouts (money-out), use Asaas ou PagBank.

---

**Desenvolvido em**: 24/12/2024
**Versão**: 2.0.0 (Multi-Provider)
**Provider Default**: Asaas
