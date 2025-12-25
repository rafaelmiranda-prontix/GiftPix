Excelente ponto — **sim, é melhor estruturar a Home da área logada antes da feature de criação**.
Isso é **decisão correta de produto**, não só de UX.

Vou te explicar **por quê** e já deixo a **feature da Home Logada (Dashboard)** pronta no padrão PRD.

---

## ✅ Por que a Home Logada vem antes da Criação do GiftPix?

### Visão de Produto

* A **Home define o “centro de gravidade” do produto**
* A criação de GiftPix é uma **ação**, não o produto em si
* O usuário precisa entender:

  * Onde está
  * O que já fez
  * O que pode fazer agora

### UX Correta

Fluxo saudável:

```
Landing → Cadastro/Login → Home Logada → Criar GiftPix
```

Evita:

* Usuário perdido após login
* Feature isolada sem contexto
* Retrabalho de navegação depois

---

# 🏠 Feature — Home da Área Logada (Dashboard)

![Image](https://s3-alpha.figma.com/hub/file/2152571349/3c9207ab-8f98-4b27-b5f3-aa840c4bbdf3-cover.png)

![Image](https://mir-s3-cdn-cf.behance.net/project_modules/1400/807fcc118023369.6080e3084d992.png)

![Image](https://cdn.dribbble.com/userupload/40366542/file/original-9cd0ed7c92cc9ec099fe5b499e5086f2.png?resize=752x\&vertical=center)

**Produto:** GiftPix
**Tipo:** Core Feature (Estruturante)
**Prioridade:** Alta (pré-requisito para criação)
**Status:** Planejada (MVP)

---

## 1. Objetivo da Feature

Servir como **ponto central da experiência do usuário logado**, permitindo:

* Visualizar gifts criados
* Entender status dos gifts
* Acessar criação de novo GiftPix
* Ter clareza e confiança no produto

---

## 2. Público-Alvo

* Usuário autenticado (quem presenteia)
* Pessoa física (MVP)
* Usuários recorrentes

---

## 3. Princípios de Design

* Clareza > estética
* Mobile-first
* Poucos dados, bem organizados
* CTA principal sempre visível
* Visual fintech (confiança)

---

## 4. Estrutura da Home Logada (MVP)

### 4.1 Header

**Elementos:**

* Logo GiftPix
* Saudação:

  > “Olá, Rafael 👋”
* Menu simples:

  * Home
  * Criar GiftPix
  * Perfil
  * Sair

---

### 4.2 CTA Principal (Destaque)

**Objetivo:** Direcionar ação principal

📌 Card ou botão grande:

> **Criar novo GiftPix**

* Visível sem scroll
* Cor primária da marca
* Leva direto à feature de criação

---

### 4.3 Resumo Rápido (Cards)

**Objetivo:** Feedback imediato ao usuário

Cards:

* 🎁 Gifts criados
* ✅ Gifts resgatados
* ⏳ Gifts pendentes
* 💰 Valor total enviado (opcional)

---

### 4.4 Lista de GiftPix Criados

**Objetivo:** Histórico e controle

Campos por item:

* Valor
* Data de criação
* Status:

  * Ativo
  * Resgatado
  * Expirado
* Ações:

  * Ver detalhes
  * Copiar link / QR Code

---

### 4.5 Estados da Tela

#### Estado Vazio (Primeiro acesso)

Mensagem:

> “Você ainda não criou nenhum GiftPix.”

CTA:

> **Criar meu primeiro GiftPix**

---

## 5. Funcionalidades da Home

### Funcionais

* Listar gifts do usuário
* Paginação simples
* Navegação para detalhes
* Navegação para criação

### Não Funcionais

* Performance rápida
* Dados atualizados
* Responsivo
* Acessível

---

## 6. Requisitos Técnicos

### Frontend

* Next.js (App Router)
* Componentes reutilizáveis
* Fetch autenticado

### Backend

* Endpoint:

  * `GET /gifts`
  * `GET /gifts/summary`

---

## 7. Dados Exibidos (Resumo)

```json
{
  "totalGifts": 5,
  "redeemed": 3,
  "pending": 2,
  "gifts": [
    {
      "id": "uuid",
      "amount": 150,
      "status": "PENDING",
      "createdAt": "2025-01-10"
    }
  ]
}
```

---

## 8. Critérios de Aceite

✅ Usuário entende onde está
✅ CTA “Criar GiftPix” sempre visível
✅ Histórico claro
✅ Funciona bem no mobile
✅ Estado vazio tratado

---

## 9. Riscos se não existir

* Usuário perdido após login
* Feature de criação isolada
* Baixa recorrência
* Sensação de produto “incompleto”

---

## 10. Evoluções Futuras

* Filtros (status, data)
* Busca
* Dashboard financeiro
* Versão B2B
* Notificações

---

## 11. Resumo Executivo

> **A Home Logada do GiftPix organiza a experiência do usuário, centraliza ações e prepara o terreno para a criação e gestão dos gifts.**

---

### ✅ Ordem correta das próximas features

1. **Home Logada (Dashboard)** ← agora
2. **Criação de GiftPix**
3. **Detalhes do GiftPix**
4. **Resgate do GiftPix**

