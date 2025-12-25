Perfeito. Vou estruturar **como se fosse um documento real de produto**, no nível que você poderia entregar **para time de dev, parceiros ou até investidores**.
Vou separar em **PRD completo** + **Arquitetura Técnica**, já usando o nome **GiftPix** (provisório).

---

# 📄 PRD — GiftPix

**Product Requirements Document**

![Image](https://assets-160c6.kxcdn.com/wp-content/uploads/2023/11/2023-11-21-de-en-1.jpg)

![Image](https://docs.radial.com/ptf/Content/Topics/payments/images/gift-card/Redeem-flow.png)

![Image](https://miro.medium.com/1%2A0B9k9qUUL3r5CLEXfu3-bg.jpeg)

## 1. Visão do Produto

**Nome:** GiftPix
**Categoria:** Fintech / Pagamentos / Gifts Digitais
**Status:** MVP Planejado

### 1.1 Objetivo

Permitir que qualquer pessoa presenteie outra com dinheiro via Pix de forma **segura, simbólica e experiencial**, utilizando um fluxo similar ao de **gift cards**, mas com liquidação via Pix.

---

## 2. Problema & Oportunidade

### Problemas Atuais

* Pix direto não gera experiência de presente
* Necessidade de saber a chave Pix do destinatário
* Falta de controle (uso único, validade, rastreio)
* Empresas não têm solução simples para bonificações via Pix

### Oportunidade

Criar uma camada de **experiência, segurança e controle** sobre o Pix, sem mudar a infraestrutura bancária existente.

---

## 3. Público-Alvo

### Primário (B2C)

* Pessoas físicas
* Usuários comuns de Pix
* Datas comemorativas (aniversário, casamento, natal)

### Secundário (B2B)

* Empresas (RH, marketing, vendas)
* Premiações, campanhas, cashback, incentivos

---

## 4. Proposta de Valor

> “Transformar transferências Pix em uma experiência de presente segura, personalizada e memorável.”

---

## 5. Escopo do Produto

### 5.1 MVP — Dentro do Escopo

#### Para quem presenteia

* Criar GiftPix com valor definido
* Pagar via Pix
* Gerar:

  * QR Code único
  * Código secreto de ativação
* Mensagem personalizada
* Compartilhamento digital (link / QR)

#### Para quem recebe

* Acessar página via QR Code
* Inserir código de ativação
* Informar chave Pix
* Receber valor automaticamente

#### Plataforma

* Gestão de status do gift
* Validação de uso único
* Execução do Pix
* Logs e auditoria
* Expiração automática

---

### 5.2 Fora do Escopo (MVP)

* Marketplace
* Split automático
* Gift em grupo
* App mobile nativo
* Internacionalização

---

## 6. Fluxo Funcional (End-to-End)

### 6.1 Criação do GiftPix

1. Usuário escolhe valor
2. Define mensagem (opcional)
3. Realiza pagamento
4. Sistema cria:

   * `gift_id`
   * QR Code público
   * Código secreto (PIN)
5. Status inicial: **ATIVO / NÃO RESGATADO**

---

### 6.2 Resgate do GiftPix

1. Destinatário escaneia QR
2. Acessa landing de resgate
3. Informa código secreto
4. Informa chave Pix
5. Confirma resgate
6. Sistema executa Pix
7. Status final: **RESGATADO**

---

## 7. Requisitos Funcionais

### 7.1 Gift

* Valor fixo (R$ mínimo e máximo configurável)
* Uso único
* Validade configurável (ex: 30, 60, 90 dias)
* Não transferível após resgate

### 7.2 Segurança

* QR Code **não executa pagamento**
* Código secreto obrigatório
* Rate limit por IP
* Bloqueio após tentativas inválidas
* Logs imutáveis

---

## 8. Requisitos Não Funcionais

* Alta disponibilidade
* Latência baixa no resgate
* Conformidade LGPD
* Observabilidade (logs, métricas, alertas)
* Escalabilidade horizontal

---

## 9. Métricas de Sucesso (KPIs)

* Gifts criados
* % de gifts resgatados
* Tempo médio de resgate
* Taxa de falha de Pix
* Receita por gift
* CAC (futuro)

---

## 10. Modelo de Monetização

* Taxa fixa por gift
* Percentual sobre valor
* Planos corporativos
* White-label (futuro)

---

# 🏗️ Arquitetura Técnica — GiftPix

![Image](https://1322024341.rsc.cdn77.org/wp-content/uploads/2022/02/img1-fin.svg)

![Image](https://hazelcast.com/wp-content/uploads/2019/05/payment-procesing-payment-hub.svg)

![Image](https://figures.semanticscholar.org/431285835efebfd28305803d3b20bfd5fcc8c91b/3-Figure1-1.png)

## 1. Visão Geral da Arquitetura

Arquitetura baseada em **microserviços**, orientada a eventos e integrada ao ecossistema Pix via **PSP (Banco / Instituição de Pagamento)**.

---

## 2. Componentes Principais

### 2.1 Frontend (Web)

* Landing pública
* Página de criação do Gift
* Página de resgate
* Tecnologias:

  * Next.js
  * Tailwind com design system reutilizável (CVA + tailwind-merge) — ver [FRONTEND_TAILWIND.md](FRONTEND_TAILWIND.md)
  * QR Code generator

---

### 2.2 Backend (API)

Responsável por toda a lógica de negócio.

**Principais módulos:**

* Gift Service
* Payment Service
* Redemption Service
* Validation Service

**Tecnologia sugerida:**

* Node.js (NestJS)
* API REST / GraphQL
* JWT interno (não para usuário final no MVP)

---

### 2.3 Banco de Dados

* PostgreSQL

**Tabelas principais:**

* `gifts`
* `gift_redemptions`
* `payments`
* `audit_logs`

---

### 2.4 Integração Pix

Via **PSP homologado**:

* Banco tradicional
* Instituição de pagamento
* APIs Pix:

  * Cobrança imediata
  * Transferência Pix outbound

---

### 2.5 Segurança

* Criptografia de códigos secretos (hash)
* Token temporário no resgate
* WAF / Rate limit
* Segredos em Vault / KMS

---

### 2.6 Observabilidade

* Logs estruturados
* Métricas:

  * Resgates
  * Erros Pix
* Alertas de falha

---

## 3. Fluxo Técnico de Resgate (Simplificado)

1. QR → Frontend
2. Front → API Gift
3. Validação código
4. Criação de transação
5. Chamada Pix PSP
6. Confirmação
7. Update status + auditoria

---

## 4. Considerações Regulatórias (Importante)

⚠️ Pontos críticos a validar:

* Você **não é banco**
* Atua como **iniciador / intermediador**
* Precisa:

  * Conta de liquidação
  * Parceiro PSP
  * Termos claros de uso
* LGPD (dados sensíveis)

---

## 5. Roadmap Técnico (Resumo)

### Fase 1 — MVP

* Web
* Pix
* Gift simples
* Logs básicos

### Fase 2

* Dashboard
* Histórico
* Templates
* Corporativo

### Fase 3

* App mobile
* White-label
* Split
* Gift coletivo

---

## 6. Riscos Principais

* Regulação Pix
* Fraude (engenharia social)
* Chargeback indireto
* Dependência do PSP

---

## 7. Próximos Passos

1. Validar regulação / PSP
2. Refinar MVP
3. Definir branding
4. Escolher stack final
5. Criar protótipo navegável

Statks

| Camada   | Tecnologia                |
| -------- | ------------------------- |
| Frontend | Next.js + Tailwind        |
| Backend  | NestJS                    |
| Banco    | PostgreSQL Supabase ou Stanalone       |
| ORM      | Prisma                    |
| Pix      | PSP (Asaas / Gerencianet) |
| Auth     | JWT (temporário)          |
| QR Code  | react-qr-code             |
| Infra    | Vercel + Railway          |
| Logs     | Pino                      |



---

👉 **Próximo passo natural:**
Posso:

* Refinar isso em **PRD para investidores**
* Criar **diagrama C4**
* Desenhar **modelo de dados**
* Avaliar **nome GiftPix (branding, riscos legais, domínio)**

Quando quiser, seguimos 🚀
