Perfeito.
A **Feature: Perfil do Usuário** fecha o **núcleo de gestão do usuário**, dá maturidade ao produto e prepara o terreno para **B2B, KYC e antifraude** no futuro.

Abaixo está a feature no **padrão PRD**, consistente com tudo que já definimos.

---

# 👤 Feature — Perfil do Usuário

**Produto:** GiftPix
**Tipo:** Feature de Gestão do Usuário
**Prioridade:** Média-Alta (MVP+)
**Status:** Planejada

![Image](https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/f1f692178988479.64f18d6be4f8e.png)

![Image](https://miro.medium.com/1%2A431pU7BjEJQS1cDL8sOFBQ.jpeg)

![Image](https://www.instaclustr.com/wp-content/uploads/2022/07/UserProfile-security.jpg)

---

## 1. Objetivo da Feature

Permitir que o usuário **visualize e gerencie seus dados básicos**, aumentando:

* Confiança no produto
* Transparência
* Autonomia
* Preparação para features futuras (KYC, B2B)

---

## 2. Público-Alvo

* Usuário autenticado (presenteador)
* Pessoa física
* Usuários recorrentes

---

## 3. Princípios de Design

* Simplicidade
* Clareza
* Segurança
* Mobile-first
* Edição mínima no MVP

---

## 4. Acesso à Feature

* A partir da **Home Logada**
* Menu: **Perfil**
* URL:

```
/profile
```

---

## 5. Estrutura da Tela (MVP)

### 5.1 Cabeçalho do Perfil

**Exibe:**

* Nome do usuário
* E-mail cadastrado
* Status da conta:

  * Ativa
  * E-mail não verificado

---

### 5.2 Dados Pessoais (Somente Leitura)

**Campos exibidos:**

* Nome completo
* E-mail

🔒 **Regra:**
E-mail **não pode ser alterado** no MVP (evita fraude).

---

### 5.3 Alteração de Senha

**Campos:**

* Senha atual
* Nova senha
* Confirmação da nova senha

**Regras:**

* Senha mínima (8 caracteres)
* Confirmação obrigatória
* Logout de sessões ativas após alteração

---

### 5.4 Preferências Básicas (MVP)

* Receber notificações por e-mail:

  * ☑️ Ativado por padrão

---

### 5.5 Ações da Conta

* **Sair**
* **Excluir conta** (soft delete)

⚠️ Excluir conta:

* Não remove gifts já criados
* Dados ficam anonimizados (LGPD)

---

## 6. Funcionalidades da Feature

### Funcionais

* Visualizar dados do usuário
* Alterar senha
* Gerenciar preferências simples
* Encerrar sessão

### Não Funcionais

* Segurança forte
* Resposta rápida
* Feedback visual claro

---

## 7. Regras de Negócio

* Usuário só acessa seu próprio perfil
* Alteração de senha invalida tokens
* Conta excluída:

  * Não pode criar novos GiftPix
  * Mantém histórico para auditoria

---

## 8. Requisitos Técnicos

### Backend

* `GET /users/me`
* `PUT /users/password`
* `DELETE /users/me`

### Frontend

* Página protegida
* Validação de formulário
* Confirmações explícitas

---

## 9. Dados Persistidos

### Tabela `users` (Complemento)

| Campo              | Tipo      |
| ------------------ | --------- |
| notification_email | boolean   |
| deleted_at         | timestamp |

---

## 10. Critérios de Aceite

✅ Usuário vê seus dados corretamente
✅ Senha pode ser alterada com segurança
✅ Preferências persistem
✅ Exclusão de conta respeita LGPD

---

## 11. Riscos

* Usuário esquecer senha atual
* Tentativas de engenharia social
* Exclusão acidental de conta

---

## 12. Evoluções Futuras

* Alterar e-mail
* KYC (documentos)
* Perfil corporativo
* Multi-usuário
* Preferências avançadas

---

## 13. Resumo Executivo

> **O Perfil do Usuário oferece controle e transparência, fortalecendo a confiança no GiftPix e preparando a plataforma para crescer com segurança.**

---

## 🧭 Próxima sequência lógica de features

1. ✅ Perfil do Usuário
2. ➡️ **Feature: Histórico & Relatórios**
3. Feature: Antifraude (MVP)
4. Feature: Configurações Avançadas
5. Feature: B2B / Corporativo

👉 Seguimos com **Histórico & Relatórios** ou prefere ir direto para **Antifraude (MVP)**?
