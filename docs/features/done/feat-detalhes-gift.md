Perfeito. Essa feature é **fundamental para confiança, controle e recorrência**.
Ela conecta **criação → compartilhamento → resgate**, e é onde o usuário “acompanha o presente”.

Abaixo está a **Feature: Detalhes do GiftPix**, no mesmo padrão PRD, pronta para backlog e desenvolvimento.

---

# 🎁 Feature — Detalhes do GiftPix

**Produto:** GiftPix
**Tipo:** Core Feature (Gestão & Acompanhamento)
**Prioridade:** Alta
**Status:** Planejada (MVP)

![Image](https://passkit.com/images/gift-card-in-google-wallet%402x.png)

![Image](https://cdn.dribbble.com/userupload/15439657/file/original-9f0720ccc90dc65398d4c6733269c5b0.png?format=webp\&resize=400x300\&vertical=center)

![Image](https://support.hihello.com/hc/article_attachments/26570145773851)

---

## 1. Objetivo da Feature

Permitir que o usuário visualize e gerencie um **GiftPix específico**, acompanhando seu status, acessando o QR Code e código secreto, e entendendo claramente se o presente já foi resgatado, expirou ou ainda está disponível.

---

## 2. Público-Alvo

* Usuário autenticado
* Usuário que criou um ou mais GiftPix
* Usuários que retornam para acompanhar o status do presente

---

## 3. Princípios de Design

* Transparência total
* Clareza de status
* Fácil compartilhamento
* Mobile-first
* Linguagem simples (não técnica)

---

## 4. Acesso à Feature

* A partir da **Home Logada**
* Clique em um item da lista de GiftPix
* URL padrão:

  ```
  /gifts/{gift_id}
  ```

---

## 5. Estrutura da Tela (MVP)

### 5.1 Cabeçalho do GiftPix

**Informações exibidas:**

* Valor do GiftPix (destaque)
* Data de criação
* Status atual (badge visual)

**Status possíveis (UI):**

* 🟢 Ativo
* ✅ Resgatado
* ⏳ Expirado
* ❌ Cancelado

---

### 5.2 QR Code do GiftPix

**Objetivo:** Compartilhamento

* QR Code público
* Texto explicativo:

  > “Envie este QR Code junto com o código secreto para quem vai receber o presente.”

**Ações:**

* Baixar QR Code
* Copiar link do GiftPix
* Compartilhar (mobile)

---

### 5.3 Código Secreto

**Exibição controlada:**

* Código mascarado por padrão (••••••)
* Botão “Mostrar código”
* Botão “Copiar código”

**Aviso de segurança:**

> “O código secreto é necessário para resgatar o GiftPix.”

---

### 5.4 Mensagem Personalizada

* Exibição da mensagem escrita na criação
* Caso não exista:

  > “Nenhuma mensagem personalizada”

---

### 5.5 Informações Complementares

* Validade do GiftPix
* Regras:

  * Uso único
  * Não reembolsável após resgate
  * Não editável

---

### 5.6 Estado Pós-Resgate

Quando o status for **RESGATADO**, exibir:

* Data e hora do resgate
* Mensagem:

  > “Este GiftPix já foi resgatado com sucesso 🎉”

⚠️ Não exibir QR Code nem código secreto

---

## 6. Funcionalidades da Feature

### Funcionais

* Exibir detalhes completos do GiftPix
* Exibir status em tempo real
* Permitir copiar/baixar QR Code
* Permitir copiar código secreto
* Atualizar UI conforme status

### Não Funcionais

* Segurança na exibição do código
* Performance rápida
* Responsividade
* Acessibilidade

---

## 7. Regras de Negócio

* Apenas o **criador** pode acessar os detalhes
* Código secreto:

  * Nunca exibido em texto puro no backend
  * Apenas revelado no frontend sob ação do usuário
* GiftPix resgatado:

  * Não pode ser reutilizado
  * Não pode ser compartilhado novamente

---

## 8. Estados da Tela

### 8.1 Gift Ativo

* QR Code visível
* Código secreto disponível
* Ações de compartilhamento ativas

### 8.2 Gift Resgatado

* Status final
* Mensagem de sucesso
* Dados de resgate

### 8.3 Gift Expirado

* Status expirado
* Mensagem explicativa
* Nenhuma ação disponível

---

## 9. Requisitos Técnicos

### Backend

* Endpoint:

  ```
  GET /gifts/{id}
  ```

### Frontend

* Página protegida (auth)
* Atualização de status ao carregar
* Tratamento de erros (404 / acesso negado)

---

## 10. Dados Exibidos (Exemplo)

```json
{
  "id": "uuid",
  "amount": 200,
  "status": "ACTIVE",
  "message": "Parabéns 🎉",
  "expiresAt": "2025-03-01T23:59:59Z",
  "createdAt": "2025-01-10T10:00:00Z"
}
```

---

## 11. Critérios de Aceite

✅ Usuário entende claramente o status
✅ QR Code e código acessíveis quando ativo
✅ Estado pós-resgate bem definido
✅ Funciona bem no mobile
✅ Acesso restrito ao criador

---

## 12. Riscos

* Compartilhamento indevido do código
* Confusão de status
* Acesso não autorizado (mitigado por auth)

---

## 13. Evoluções Futuras

* Reenvio por e-mail
* Histórico de acessos
* Confirmação de visualização
* Lembrete de resgate
* Cancelamento antes do resgate

---

## 14. Resumo Executivo

> **A tela de Detalhes do GiftPix dá controle, transparência e confiança ao usuário, permitindo acompanhar o presente do início ao fim.**

---

### ✅ Próximo passo lógico no produto

➡️ **Feature: Resgate do GiftPix (lado do presenteado)**
Depois disso, o fluxo core do MVP fica **100% fechado**.

Seguimos para o **Resgate do GiftPix**?
