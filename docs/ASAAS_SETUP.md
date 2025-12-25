# Guia de Configuração - Asaas

Este guia explica como configurar e usar o Asaas como provedor de pagamento PIX para o projeto Gift PIX Payout.

## Por que Asaas?

✅ **API completa de transferências PIX**
✅ **Suporte a payouts (money-out)**
✅ **Documentação clara e detalhada**
✅ **Taxas competitivas**
✅ **Sandbox para testes**
✅ **Suporte em português**

## 1. Criar Conta Asaas

### Passo 1: Registro

1. Acesse [https://www.asaas.com/](https://www.asaas.com/)
2. Clique em "Criar conta grátis"
3. Preencha os dados da sua empresa (PJ - Pessoa Jurídica)
4. Complete o cadastro e validação

### Passo 2: Obter API Key

1. Faça login no painel Asaas
2. Vá em **Integrações** > **API** no menu lateral
3. Gere uma chave API:
   - **Ambiente Sandbox**: Para testes (recomendado inicialmente)
   - **Ambiente Produção**: Para uso real

4. Copie a API key gerada

## 2. Configurar o Projeto

### Editar arquivo `.env`

```bash
# Payment Provider
PAYMENT_PROVIDER=asaas

# Asaas API Configuration
ASAAS_API_URL=https://sandbox.asaas.com/api
ASAAS_API_KEY=sua_api_key_aqui
```

### Ambientes Disponíveis

| Ambiente | URL | Uso |
|----------|-----|-----|
| **Sandbox** | `https://sandbox.asaas.com/api` | Testes (sem transações reais) |
| **Produção** | `https://api.asaas.com` | Uso em produção (transações reais) |

## 3. Testar Conexão

### Instalar dependências

```bash
npm install
```

### Rodar em desenvolvimento

```bash
npm run dev
```

### Testar endpoint

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-12-24T20:00:00.000Z"
  }
}
```

## 4. Enviar Primeira Transferência PIX (Teste)

### Exemplo com cURL

```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "teste@teste.com",
    "valor": 10.00,
    "descricao": "Teste Asaas"
  }'
```

### Resposta de Sucesso

```json
{
  "success": true,
  "data": {
    "message": "PIX enviado com sucesso",
    "provider": "asaas",
    "transaction": {
      "id": "uuid",
      "reference_id": "uuid",
      "provider_transaction_id": "tra_abc123",
      "status": "completed",
      "chave_pix": "teste@teste.com",
      "valor": 10.00,
      "created_at": "2024-12-24T20:00:00.000Z"
    }
  }
}
```

## 5. Tipos de Chave PIX Suportados

O Asaas detecta automaticamente o tipo de chave PIX:

| Tipo | Formato | Exemplo |
|------|---------|---------|
| **CPF** | 11 dígitos | `12345678901` |
| **CNPJ** | 14 dígitos | `12345678000190` |
| **E-mail** | email@dominio.com | `usuario@exemplo.com` |
| **Telefone** | +55DDNNNNNNNNN | `+5511999999999` |
| **EVP (Chave Aleatória)** | UUID | `123e4567-e89b-...` |

## 6. Status das Transferências

| Status Asaas | Status Normalizado | Descrição |
|--------------|-------------------|-----------|
| `PENDING` | `pending` | Aguardando processamento |
| `BANK_PROCESSING` | `pending` | Sendo processado pelo banco |
| `DONE` | `completed` | Transferência concluída |
| `CANCELLED` | `failed` | Transferência cancelada |
| `FAILED` | `failed` | Transferência falhou |

## 7. Consultar Status de Transferência

```bash
curl -H "x-api-key: your_secret_key_here_change_in_production" \
  http://localhost:3000/api/pix-payout/reference-id-aqui
```

## 8. Limites e Taxas Asaas

### Taxas (verifique valores atualizados no site oficial)

- **Transferência PIX**: Geralmente R$ 0,00 ou taxa fixa baixa
- **Saque**: Pode ter taxa dependendo do plano
- **Manutenção**: Consulte seu plano

### Limites

Os limites variam de acordo com:
- Tipo de conta (MEI, ME, etc.)
- Tempo de cadastro
- Volume transacional
- Documentação enviada

**Recomendação**: Entre em contato com o suporte Asaas para verificar seus limites específicos.

## 9. Webhook (Notificações de Status)

O Asaas envia webhooks para notificar mudanças de status. Para configurar:

1. Acesse o painel Asaas
2. Vá em **Integrações** > **Webhooks**
3. Configure a URL do seu servidor: `https://seu-dominio.com/api/webhooks/asaas`
4. Selecione os eventos: `TRANSFER_STATUS_CHANGED`

### Implementar webhook (opcional)

```typescript
// src/routes/index.ts
router.post('/webhooks/asaas', async (req, res) => {
  const event = req.body;

  // Processar evento
  logger.info('Asaas webhook received', { event });

  // Atualizar status da transação local
  if (event.event === 'TRANSFER_STATUS_CHANGED') {
    await transactionStore.update(event.transfer.id, {
      status: event.transfer.status
    });
  }

  res.json({ received: true });
});
```

## 10. Ambiente Sandbox vs Produção

### Sandbox (Testes)

✅ Use para desenvolvimento e testes
✅ Não realiza transferências reais
✅ Dados de teste não afetam saldo real
✅ API Key diferente

**Configuração Sandbox:**
```env
ASAAS_API_URL=https://sandbox.asaas.com/api
ASAAS_API_KEY=sua_api_key_sandbox
```

### Produção

⚠️ Use apenas quando estiver pronto
⚠️ Transferências reais serão executadas
⚠️ Certifique-se de ter saldo
⚠️ Valide todas as integrações em sandbox primeiro

**Configuração Produção:**
```env
ASAAS_API_URL=https://api.asaas.com
ASAAS_API_KEY=sua_api_key_producao
NODE_ENV=production
```

## 11. Troubleshooting

### Erro: "Sem resposta da API Asaas"

**Causa**: Timeout ou problema de rede

**Solução**:
- Verifique sua conexão internet
- Verifique se a API URL está correta
- Teste diretamente: `curl https://sandbox.asaas.com/api/v3/customers`

### Erro: "401 Unauthorized"

**Causa**: API Key inválida ou não configurada

**Solução**:
- Verifique se a API Key está correta no `.env`
- Certifique-se de usar a key do ambiente correto (sandbox/produção)
- Gere uma nova API Key no painel Asaas

### Erro: "Insufficient balance"

**Causa**: Saldo insuficiente na conta Asaas

**Solução**:
- Adicione saldo à sua conta Asaas
- Em sandbox, o saldo geralmente é ilimitado para testes

### Erro: "Invalid PIX key"

**Causa**: Chave PIX inválida ou não cadastrada

**Solução**:
- Verifique o formato da chave PIX
- Em sandbox, use chaves de teste fornecidas pelo Asaas
- Certifique-se de que a chave PIX existe

## 12. Recursos Adicionais do Asaas

Além de transferências PIX, o Asaas oferece:

- **Cobranças** (receber pagamentos)
- **PIX QR Code dinâmico** (recebimento)
- **PIX Recorrente** (transferências agendadas)
- **Split de pagamentos**
- **Antecipação de recebíveis**

## 13. Documentação Oficial

- **Portal de Desenvolvedores**: [https://docs.asaas.com](https://docs.asaas.com)
- **API de Transferências**: [https://docs.asaas.com/reference/transferir-para-conta-de-outra-instituicao-ou-chave-pix](https://docs.asaas.com/reference/transferir-para-conta-de-outra-instituicao-ou-chave-pix)
- **FAQ PIX**: [https://docs.asaas.com/docs/pix](https://docs.asaas.com/docs/pix)
- **Blog**: [https://blog.asaas.com](https://blog.asaas.com)

## 14. Suporte

### Suporte Asaas

- **E-mail**: suporte@asaas.com
- **Chat**: Disponível no painel
- **Telefone**: Consulte o site oficial
- **Central de Ajuda**: https://ajuda.asaas.com

### Suporte do Projeto

- Issues: Abra uma issue no repositório do projeto
- Documentação: Leia o [README.md](README.md)

## 15. Checklist de Produção

Antes de ir para produção, certifique-se de:

- [ ] Testou todas as funcionalidades em sandbox
- [ ] Trocou `ASAAS_API_URL` para produção
- [ ] Trocou `ASAAS_API_KEY` para a chave de produção
- [ ] Configurou `NODE_ENV=production`
- [ ] Configurou HTTPS (use reverse proxy)
- [ ] Trocou `API_SECRET_KEY` para algo seguro
- [ ] Implementou webhook para notificações
- [ ] Configurou monitoramento e alertas
- [ ] Tem saldo suficiente na conta Asaas
- [ ] Revisou limites de transação
- [ ] Fez backup das configurações

## 16. Exemplo Completo

```bash
# 1. Configure o .env
cat > .env << EOF
PAYMENT_PROVIDER=asaas
ASAAS_API_URL=https://sandbox.asaas.com/api
ASAAS_API_KEY=\$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5Y2IyNzU3MjIwZGQ6OjAwMDAwMDAwMDAwMDAwNzY0Mjk6OiRhYWNoXzUzYzU0YTYyLWIwODItNGFlOS1iNTMwLWIzZDkyMmU4YWUzNw==
API_SECRET_KEY=minha_chave_super_secreta
EOF

# 2. Instale dependências
npm install

# 3. Rode o servidor
npm run dev

# 4. Em outro terminal, teste
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: minha_chave_super_secreta" \
  -d '{
    "chave_pix": "teste@asaas.com",
    "valor": 5.00,
    "descricao": "Primeira transferência"
  }'
```

---

Pronto! Agora você está usando o Asaas para transferências PIX. 🚀

**Próximos passos**: Leia [EXEMPLOS.md](EXEMPLOS.md) para mais exemplos de uso.
