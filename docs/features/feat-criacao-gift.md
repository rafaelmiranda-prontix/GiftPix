Perfeito. Agora seguimos **na ordem correta de produto** 👍
Vou escrever a **Feature: Criação de GiftPix** no mesmo padrão de PRD, **100% alinhada com a Home Logada**, MVP-first e já pensando na evolução.

---

# 🎁 Feature — Criação de GiftPix

**Produto:** GiftPix
**Tipo:** Core Feature (Geração de Valor)
**Prioridade:** Máxima (coração do produto)
**Status:** Planejada (MVP)

![Image](https://www.abl.com/wp-content/uploads/2024/12/QR-Code-Generator.png)

![Image](https://images.prismic.io/checkout-website-v2/0e4b1849-f8c0-4e04-91c9-fefc7b0d7a65_image-metaimage.png?auto=compress%2Cformat)

![Image](https://docs.radial.com/ptf/Content/Topics/payments/images/gift-card/FundAndActivate-flow.png)

---

## 1. Objetivo da Feature

Permitir que o usuário autenticado **crie um GiftPix**, definindo um valor e opcionalmente uma mensagem, realizando o pagamento e recebendo um **QR Code + código secreto** para presentear outra pessoa.

---

## 2. Público-Alvo

* Usuário autenticado (pessoa física)
* Usuário que deseja presentear com dinheiro
* Usuário recorrente ou primeiro acesso

---

## 3. Princípios de Design

* Simplicidade (≤ 1 minuto)
* Fluxo guiado (step-by-step)
* Segurança explícita
* Mobile-first
* Feedback visual claro

---

## 4. Fluxo Geral da Criação

```text
Home Logada
   ↓
Criar GiftPix
   ↓
Definir Valor
   ↓
Mensagem (opcional)
   ↓
Pagamento
   ↓
GiftPix Gerado
```

---

## 5. Estrutura da Feature (MVP)

### 5.1 Tela 1 — Definição do Valor

**Campos:**

* Valor do GiftPix (input monetário)

**Regras:**

* Valor mínimo: R$ X (ex: R$ 10)
* Valor máximo: R$ Y (ex: R$ 5.000)
* Apenas valores inteiros ou com centavos

**UI:**

* Input com máscara monetária
* Sugestões rápidas (R$50, R$100, R$200)

---

### 5.2 Tela 2 — Mensagem Personalizada (Opcional)

**Campos:**

* Mensagem curta (máx. 140 caracteres)

**Exemplo:**

> “Feliz aniversário! Aproveite 🎉”

---

### 5.3 Tela 3 — Revisão

**Exibe:**

* Valor do GiftPix
* Mensagem (se houver)
* Termos principais:

  * Uso único
  * Validade
  * Segurança

**Ação:**

* Botão **Continuar para pagamento**

---

### 5.4 Tela 4 — Pagamento

**Método (MVP):**

* Pix

**Fluxo:**

* Sistema gera QR Code Pix
* Usuário realiza pagamento
* Sistema aguarda confirmação (polling / webhook)

**Estados:**

* Aguardando pagamento
* Pagamento confirmado
* Pagamento expirado

---

### 5.5 Tela 5 — GiftPix Gerado

**Entrega ao usuário:**

* QR Code público do GiftPix
* Código secreto (PIN)
* Botões:

  * Copiar link
  * Baixar QR Code
  * Compartilhar

**Mensagem:**

> “Seu GiftPix está pronto para ser enviado 🎁”

---

## 6. Regras de Negócio

* GiftPix só é criado após pagamento confirmado
* Cada GiftPix:

  * ID único
  * QR Code único
  * Código secreto único
* Status inicial: **ATIVO**
* GiftPix não pode ser editado após criação

---

## 7. Estados do GiftPix

| Status   | Descrição        |
| -------- | ---------------- |
| CREATED  | Criado (interno) |
| ACTIVE   | Pronto para uso  |
| REDEEMED | Resgatado        |
| EXPIRED  | Expirado         |
| CANCELED | Cancelado (erro) |

---

## 8. Requisitos Funcionais

* Criar GiftPix
* Gerar QR Code público
* Gerar código secreto
* Associar gift ao usuário
* Persistir dados
* Enviar confirmação visual

---

## 9. Requisitos Não Funcionais

* QR Code não executa pagamento
* Código secreto nunca armazenado em texto puro
* Operação transacional
* Logs de auditoria
* Performance aceitável

---

## 10. Dados Persistidos (Simplificado)

### Tabela `gifts`

| Campo       | Tipo      | Observação |
| ----------- | --------- | ---------- |
| id          | UUID      | PK         |
| user_id     | UUID      | FK         |
| amount      | decimal   |            |
| message     | string    | opcional   |
| secret_hash | string    | bcrypt     |
| status      | enum      |            |
| expires_at  | timestamp |            |
| created_at  | timestamp |            |

---

## 11. APIs (Resumo)

### Criar Gift (pré-pagamento)

`POST /gifts/preview`

### Confirmar pagamento

`POST /payments/pix/webhook`

### Consultar Gift

`GET /gifts/{id}`

---

## 12. Critérios de Aceite

✅ GiftPix só aparece após pagamento
✅ QR Code + código são únicos
✅ Usuário consegue compartilhar
✅ Fluxo funciona no mobile
✅ Status atualizado corretamente

---

## 13. Riscos

* Pagamento Pix não confirmado
* Abandono no checkout
* Erro de PSP
* Fraude básica

---

## 14. Evoluções Futuras

* Agendamento de envio
* Templates visuais
* Gift coletivo
* Pagamento via cartão
* Cashback

---

## 15. Resumo Executivo

> **A Criação de GiftPix é o coração do produto, transformando um simples Pix em uma experiência de presente segura, simples e memorável.**

---

👉 Próximo passo lógico:

* **Feature: Detalhes do GiftPix**
* **Feature: Resgate do GiftPix**
* **Wireframe completo do fluxo**
* **Modelo de APIs (OpenAPI)**

Qual seguimos agora?
