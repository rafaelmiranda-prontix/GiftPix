# Comparação de Provedores - Asaas vs PagBank

Este documento compara os dois provedores de pagamento PIX suportados pelo projeto.

## Resumo Rápido

| Critério | Asaas | PagBank |
|----------|-------|---------|
| **API de Payout PIX** | ✅ Sim | ✅ Sim |
| **Documentação** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐ Boa |
| **Suporte em Português** | ✅ Sim | ✅ Sim |
| **Sandbox/Testes** | ✅ Sim | ✅ Sim |
| **Facilidade de Integração** | ⭐⭐⭐⭐⭐ Muito fácil | ⭐⭐⭐⭐ Fácil |
| **Recursos Adicionais** | ⭐⭐⭐⭐⭐ Muitos | ⭐⭐⭐⭐ Bons |
| **Recomendação** | ✅ **Recomendado** | ✅ Também bom |

## Asaas

### ✅ Vantagens

1. **API Completa e Moderna**
   - Endpoints bem documentados
   - Respostas claras e padronizadas
   - Detecção automática de tipo de chave PIX

2. **Documentação Excelente**
   - Portal interativo: [docs.asaas.com](https://docs.asaas.com)
   - Exemplos de código em várias linguagens
   - FAQ completo

3. **Recursos Avançados**
   - PIX Recorrente (transferências agendadas)
   - Webhooks nativos
   - Split de pagamentos
   - Antecipação de recebíveis

4. **Suporte**
   - Chat no painel
   - E-mail: suporte@asaas.com
   - Central de ajuda completa

5. **Sandbox Completo**
   - Testes ilimitados
   - Simula todos os cenários
   - Não requer saldo real

### ⚠️ Considerações

- Empresa menor que PagSeguro
- Pode ter limites menores para contas novas
- Requer validação de documentos para limites maiores

### 📊 Taxas Asaas (Consulte site oficial)

- **Transferência PIX**: Geralmente R$ 0,00 ou taxa fixa baixa
- **Saque**: Pode variar
- **Manutenção**: Depende do plano

### 🔧 Configuração

```env
PAYMENT_PROVIDER=asaas
ASAAS_API_URL=https://sandbox.asaas.com/api
ASAAS_API_KEY=sua_api_key
```

📖 **Guia completo**: [ASAAS_SETUP.md](ASAAS_SETUP.md)

---

## PagBank (PagSeguro)

### ✅ Vantagens

1. **Marca Consolidada**
   - Parte do grupo UOL
   - Empresa grande e conhecida
   - Anos de experiência no mercado

2. **Infraestrutura Robusta**
   - Alta disponibilidade
   - Escalabilidade comprovada

3. **Limites Altos**
   - Bom para alto volume
   - Aprovação mais rápida para limites maiores

4. **Recursos Completos**
   - Gateway de pagamento completo
   - Múltiplas formas de pagamento
   - Antifraude integrado

### ⚠️ Considerações

- Documentação menos intuitiva
- API pode ser mais complexa
- Suporte pode demorar mais

### 📊 Taxas PagBank (Consulte site oficial)

- **Transferência PIX**: Verifique com PagBank
- **Outras operações**: Consulte tabela de tarifas

### 🔧 Configuração

```env
PAYMENT_PROVIDER=pagbank
PAGBANK_API_URL=https://sandbox.api.pagseguro.com
PAGBANK_API_TOKEN=seu_token
PAGBANK_EMAIL=seu_email@pagseguro.com
```

---

## Comparação Técnica

### API Endpoints

#### Asaas
```
POST https://sandbox.asaas.com/api/v3/transfers
GET  https://sandbox.asaas.com/api/v3/transfers/{id}
```

#### PagBank
```
POST https://sandbox.api.pagseguro.com/transfers
GET  https://sandbox.api.pagseguro.com/transfers/{id}
```

### Formato de Requisição

#### Asaas (Mais Simples)
```json
{
  "value": 100.00,
  "pixAddressKey": "exemplo@exemplo.com",
  "pixAddressKeyType": "EMAIL",
  "description": "Transferência"
}
```

#### PagBank
```json
{
  "reference_id": "ref123",
  "amount": {
    "value": 10000
  },
  "destination": {
    "type": "PIX",
    "pix_key": "exemplo@exemplo.com"
  },
  "description": "Transferência"
}
```

### Resposta

#### Asaas (Mais Completa)
```json
{
  "id": "tra_123",
  "dateCreated": "2024-12-24",
  "value": 100.00,
  "netValue": 100.00,
  "transferFee": 0.00,
  "status": "DONE",
  "effectiveDate": "2024-12-24",
  "type": "PIX",
  "pixAddressKey": "exemplo@exemplo.com",
  "description": "Transferência"
}
```

#### PagBank
```json
{
  "id": "TRANS_123",
  "reference_id": "ref123",
  "status": "COMPLETED",
  "amount": {
    "value": 10000
  },
  "created_at": "2024-12-24T20:00:00Z",
  "destination": {
    "type": "PIX",
    "pix_key": "exemplo@exemplo.com"
  }
}
```

---

## Casos de Uso Recomendados

### Use Asaas quando:

- ✅ Você precisa de **documentação clara** e fácil de seguir
- ✅ Quer **PIX Recorrente** (transferências agendadas)
- ✅ Precisa de **webhooks** robustos
- ✅ Prefere uma **API mais moderna** e simples
- ✅ Está começando e quer **setup rápido**
- ✅ Precisa de **split de pagamentos**

### Use PagBank quando:

- ✅ Já tem conta e integração com PagSeguro
- ✅ Precisa de **limites muito altos** desde o início
- ✅ Quer a segurança de uma **marca consolidada**
- ✅ Já está familiarizado com a plataforma
- ✅ Precisa de outros serviços além de PIX

---

## Performance

Ambos os provedores têm performance similar:

| Métrica | Asaas | PagBank |
|---------|-------|---------|
| **Tempo de Resposta** | ~300-500ms | ~400-600ms |
| **Uptime** | >99.5% | >99.5% |
| **Processamento PIX** | Instantâneo | Instantâneo |

---

## Migrando entre Provedores

### É Fácil Trocar?

✅ **SIM!** A arquitetura do projeto permite trocar de provider facilmente:

1. Altere a variável `PAYMENT_PROVIDER` no `.env`
2. Configure as credenciais do novo provider
3. Reinicie a aplicação

```bash
# De Asaas para PagBank
PAYMENT_PROVIDER=pagbank

# De PagBank para Asaas
PAYMENT_PROVIDER=asaas
```

### Usando Ambos Simultaneamente

Embora o projeto use apenas um provider por vez, você pode:

1. Configurar ambos no `.env`
2. Trocar conforme necessário
3. Implementar lógica customizada para usar ambos (requer código adicional)

---

## Custos Estimados

**⚠️ Importante**: Consulte os sites oficiais para valores atualizados.

### Exemplo Hipotético (valores fictícios)

#### Asaas
- Transferência PIX: R$ 0,00
- Saque: R$ 3,00 ou grátis
- Manutenção: R$ 0,00 (plano básico)

#### PagBank
- Transferência PIX: Consulte PagBank
- Outras taxas: Consulte tabela

---

## Suporte

### Asaas
- **E-mail**: suporte@asaas.com
- **Chat**: Disponível no painel
- **Docs**: [docs.asaas.com](https://docs.asaas.com)
- **Blog**: [blog.asaas.com](https://blog.asaas.com)

### PagBank
- **Central de Ajuda**: PagSeguro Help Center
- **E-mail**: Via formulário
- **Telefone**: Consulte site
- **Docs**: [developer.pagbank.com.br](https://developer.pagbank.com.br)

---

## Conclusão

### 🏆 Recomendação Geral: **Asaas**

**Por quê?**
- ✅ API mais simples e moderna
- ✅ Documentação superior
- ✅ Setup mais rápido
- ✅ Recursos avançados (PIX Recorrente, etc.)
- ✅ Webhooks nativos
- ✅ Melhor experiência de desenvolvedor

### Quando escolher PagBank?
- Se você já usa PagSeguro
- Se precisa de limites muito altos imediatamente
- Se prefere marca consolidada

---

## Links Úteis

### Asaas
- **Site**: https://www.asaas.com
- **Documentação**: https://docs.asaas.com
- **API Transferências**: https://docs.asaas.com/reference/transferir-para-conta-de-outra-instituicao-ou-chave-pix
- **Setup Guide**: [ASAAS_SETUP.md](ASAAS_SETUP.md)

### PagBank
- **Site**: https://pagseguro.uol.com.br
- **Developer Portal**: https://developer.pagbank.com.br
- **Documentação API**: https://developer.pagbank.com.br/reference

---

**Última atualização**: Dezembro 2024

**Precisa de ajuda?** Leia a documentação completa em [README.md](README.md)
