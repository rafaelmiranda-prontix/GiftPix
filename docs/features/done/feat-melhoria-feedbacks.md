
# 🔄 Melhoria 1 — Status do Pix (Integração com PSP)

![Image](https://docs.volt.io/wp-content/uploads/2023/02/payment-status-flow.png)

![Image](https://cdn.dribbble.com/userupload/44232793/file/e0a763a03aa1f58a783533549e82d36a.png?format=webp\&resize=400x300\&vertical=center)

![Image](https://user-images.githubusercontent.com/20977376/62955346-e2eb0600-bdbe-11e9-857d-b455fc25a572.png)

## 📌 Contexto

Hoje o fluxo considera o GiftPix **resgatado** no momento em que o presenteado confirma a chave Pix.
Na prática, o Pix pode estar:

* em processamento
* concluído
* com falha

Isso precisa ficar **claro para quem recebe** e **visível para quem enviou**.

---

## 🎯 Objetivo

* Consultar o **status real do Pix no PSP**
* Diferenciar **resgate do gift** de **liquidação do Pix**
* Informar claramente o presenteado quando o Pix **ainda não foi concluído**

---

## 🔁 Novos Estados de Pix

### Novo conceito

Separar:

* **Status do GiftPix**
* **Status do Pix**

### Status do Pix (via PSP)

| Status     | Descrição                                 |
| ---------- | ----------------------------------------- |
| PENDING    | Pix enviado ao PSP, aguardando liquidação |
| PROCESSING | PSP processando                           |
| COMPLETED  | Pix concluído com sucesso                 |
| FAILED     | Pix falhou                                |
| REFUNDED   | Valor estornado                           |

---

## 🧩 Impactos nas Features Existentes

### 1️⃣ Feature: Detalhes do GiftPix (Presenteador)

**Novo bloco: Status do Pix**

Exemplo de UI:

```
Status do GiftPix: RESGATADO ✅
Status do Pix: EM PROCESSAMENTO ⏳
```

Mensagens:

* **PROCESSING / PENDING**

  > “O Pix foi solicitado e está sendo processado pelo banco.”
* **COMPLETED**

  > “Pix concluído com sucesso.”
* **FAILED**

  > “Houve um problema no envio do Pix. Estamos resolvendo.”

---

### 2️⃣ Feature: Resgate do GiftPix (Presenteado)

#### Novo comportamento pós-resgate

##### Caso Pix **não concluído**

Mensagem exibida:

> “Seu GiftPix foi resgatado com sucesso 🎁
> O Pix está sendo processado pelo banco e pode levar alguns instantes para aparecer na sua conta.”

##### Caso Pix **falhe**

Mensagem:

> “Houve um problema no envio do Pix.
> Nossa equipe está processando a correção.”

🔒 **Importante:**
O presenteado **não pode tentar novamente** nem alterar a chave Pix.

---

## 🧠 Regras de Negócio (Pix)

* GiftPix = RESGATADO após confirmação do código
* Pix é executado **assincronamente**
* Status do Pix é atualizado via:

  * Webhook do PSP
  * Consulta periódica (fallback)
* Presenteado **não interage** após confirmar resgate

---

## 🔧 Requisitos Técnicos

### Backend

* Tabela `pix_transactions`
* Campos:

  * `psp_transaction_id`
  * `status`
  * `last_checked_at`

### Integração PSP

* Webhook obrigatório
* Retry automático
* Timeout configurável

---

# 💸 Melhoria 2 — Estorno Automático de GiftPix Não Resgatados

![Image](https://developers.google.com/static/standard-payments/shared/assets/flows/tokenized-fop-refund-v1/refund-flow.png)

![Image](https://trimplement.com/blog/wp-content/uploads/2023/07/Credit-Card-Refund_V5-1-1024x502.jpg)

![Image](https://wallstreetmojocms.recurpro.in/uploads/Payment_Reversal_1095698253.png)

## 📌 Contexto

GiftPix pode **não ser resgatado**.
O valor não deve ficar indefinidamente retido.

---

## 🎯 Objetivo

Permitir **estorno automático** de GiftPix **não resgatados** após **X dias**, configurável no banco de dados.

---

## ⚙️ Configuração de Estorno

### Parâmetro Global (Banco)

Tabela `system_config`

| Campo                    | Exemplo |
| ------------------------ | ------- |
| refund_days_not_redeemed | 30      |

---

## 🔁 Fluxo de Estorno Automático

```text
GiftPix ATIVO
   ↓
Prazo X dias expirou
   ↓
GiftPix não resgatado
   ↓
Iniciar estorno
   ↓
Pix de volta ao presenteador
```

---

## 🧩 Regras de Negócio (Estorno)

* Apenas GiftPix:

  * Status = ACTIVE
  * Nunca resgatado
* Estorno:

  * Automático
  * Via Pix para o presenteador
* Após estorno:

  * GiftPix → status **REFUNDED**
  * Não pode ser reutilizado

---

## 📬 Notificações (Impacto)

### Presenteador

* E-mail:

  > “Seu GiftPix não foi resgatado e o valor foi estornado para sua conta.”

### Presenteado

* Ao tentar acessar QR Code:

  > “Este GiftPix expirou.”

---

## 🧠 Estados Atualizados do GiftPix

| Status         | Descrição                           |
| -------------- | ----------------------------------- |
| ACTIVE         | Criado e disponível                 |
| REDEEMED       | Código validado                     |
| PIX_PROCESSING | Pix em processamento                |
| PIX_COMPLETED  | Pix concluído                       |
| PIX_FAILED     | Falha no Pix                        |
| REFUNDED       | Valor estornado                     |
| EXPIRED        | Expirado sem estorno (se aplicável) |

---

## 🔧 Requisitos Técnicos (Estorno)

* Job agendado (cron)
* Consulta diária:

  * gifts ativos
  * criados há mais de X dias
* Integração Pix outbound (estorno)
* Auditoria completa

---

## ✅ Critérios de Aceite (Melhorias)

### Status Pix

✅ Status do Pix visível no detalhe
✅ Presenteado informado corretamente
✅ Pix assíncrono tratado

### Estorno

✅ Gift não resgatado é estornado após X dias
✅ Valor volta ao presenteador
✅ Gift não pode ser reutilizado

---

## 🎯 Resumo Executivo

> **Essas melhorias garantem transparência total no fluxo financeiro do GiftPix, informando corretamente o status do Pix e protegendo o usuário com estornos automáticos de gifts não resgatados.**

---

## 🧭 Próximos passos recomendados

Agora você já tem **base de fintech real**. Próximo nível:

1. **Feature: Antifraude (MVP)**
2. **Feature: Histórico & Relatórios (com status Pix)**
3. **Modelo de dados consolidado**
4. **Checklist regulatório Pix / PSP**
5. **Branding & Naming (GiftPix é o melhor?)**

👉 Quer seguir por qual?
