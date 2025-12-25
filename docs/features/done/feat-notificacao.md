
➡️ **Feature: Notificações**

---

# 🔔 Feature — Notificações do GiftPix

**Produto:** GiftPix
**Tipo:** Feature de Suporte & Confiança
**Prioridade:** Alta (MVP+)
**Status:** Planejada

![Image](https://res.cloudinary.com/mailmodo/image/upload/v1658238317/strapi/Payment_Reminder_c2af8b02a4.png)

![Image](https://framerusercontent.com/images/zSQHnr8ERFaneB0gHsnIClLIdE.jpg?height=1024\&width=801)

![Image](https://weeklybudgeting.com/wp-content/uploads/2022/06/posted_transaction_notification-600x1100.png)

---

## 1. Objetivo da Feature

Manter o usuário **informado em tempo real** sobre eventos importantes do ciclo de vida do GiftPix, aumentando:

* Confiança no produto
* Transparência
* Sensação de controle
* Redução de suporte

---

## 2. Público-Alvo

### 🎁 Presenteador (Usuário Logado)

* Criou o GiftPix
* Quer saber se:

  * Foi criado corretamente
  * Foi resgatado
  * Expirou

### 🎉 Presenteado

* Recebeu um GiftPix
* Quer confirmação do resgate

---

## 3. Princípios de Design

* Notificar apenas o essencial
* Linguagem simples
* Comunicação clara e humana
* Sem spam
* Canais mínimos no MVP

---

## 4. Eventos que Geram Notificação (MVP)

### Para o Presenteador

| Evento            | Canal  |
| ----------------- | ------ |
| GiftPix criado    | E-mail |
| GiftPix resgatado | E-mail |
| GiftPix expirado  | E-mail |

### Para o Presenteado

| Evento            | Canal               |
| ----------------- | ------------------- |
| Resgate concluído | Tela de confirmação |

---

## 5. Canais de Notificação (MVP)

### ✅ E-mail

* Canal principal
* Confiável
* Fácil implementação

### ❌ Fora do MVP

* Push notification
* SMS
* WhatsApp

---

## 6. Fluxos de Notificação

### 6.1 GiftPix Criado (Presenteador)

**Disparo:**
Após confirmação do pagamento

**Conteúdo do e-mail:**

* Valor do GiftPix
* Data de criação
* Status: Ativo
* CTA:

  > “Ver detalhes do GiftPix”

---

### 6.2 GiftPix Resgatado (Presenteador)

**Disparo:**
Após resgate bem-sucedido

**Conteúdo:**

* Valor enviado
* Data e hora do resgate
* Mensagem:

  > “Seu presente foi recebido 🎉”

---

### 6.3 GiftPix Expirado (Presenteador)

**Disparo:**
Após data de validade

**Conteúdo:**

* Valor não resgatado
* Status: Expirado
* Orientação clara sobre política (ex: saldo, estorno futuro)

---

### 6.4 Resgate Concluído (Presenteado)

**Canal:**
Tela final do fluxo

**Mensagem:**

> “Pix enviado com sucesso. O valor já está disponível na sua conta.”

---

## 7. Conteúdo das Notificações

### Padrões

* Logo GiftPix
* Linguagem positiva
* Evitar termos técnicos
* Sem dados sensíveis (chave Pix)

---

## 8. Requisitos Funcionais

* Disparar notificações por evento
* Garantir envio único
* Persistir histórico básico de envio
* Tratar falhas de envio (retry simples)

---

## 9. Requisitos Não Funcionais

* Entrega confiável
* Baixa latência
* Não bloquear fluxo principal
* Observabilidade mínima

---

## 10. Requisitos Técnicos

### Backend

* Serviço de Notificação
* Integração com provedor de e-mail (ex: SendGrid, SES)

### Tabela `notifications`

| Campo   | Tipo      |
| ------- | --------- |
| id      | UUID      |
| user_id | UUID      |
| type    | enum      |
| status  | enum      |
| sent_at | timestamp |

---

## 11. Critérios de Aceite

✅ Presenteador recebe e-mail ao criar GiftPix
✅ Presenteador recebe e-mail ao resgate
✅ Presenteado vê confirmação clara
✅ Nenhuma notificação expõe dados sensíveis

---

## 12. Riscos

* E-mails indo para spam
* Duplicidade de envio
* Falha silenciosa de provider

---

## 13. Evoluções Futuras

* Preferências de notificação
* Push notification
* WhatsApp
* Notificações in-app
* Lembrete de resgate

---

## 14. Resumo Executivo

> **As notificações do GiftPix garantem transparência e confiança, informando cada etapa importante do presente sem gerar ruído para o usuário.**

---

## 🧭 Sequência recomendada das próximas features

1. ✅ Notificações
2. ➡️ **Feature: Perfil do Usuário**
3. Feature: Histórico & Relatórios
4. Feature: Antifraude (básico)
5. Feature: Configurações & Preferências

👉 Quer seguir agora com **Feature: Perfil do Usuário** ou prefere **Antifraude (MVP)**?
