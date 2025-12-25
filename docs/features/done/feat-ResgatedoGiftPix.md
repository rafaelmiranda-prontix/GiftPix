
# 🎁 Feature — Resgate do GiftPix (Presenteado)

**Produto:** GiftPix
**Tipo:** Core Feature (Liquidação do Valor)
**Prioridade:** Máxima
**Status:** Planejada (MVP)

![Image](https://media.licdn.com/dms/image/v2/D5612AQHm1f9IIXAPYg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1719238767709?e=2147483647\&t=nZxP-NxOocg8xjDMvRjt--p6Ute-A_3D1McrRtTuJcY\&v=beta)

![Image](https://www.moderntreasury.com/_next/image?q=75\&url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F8nmbzj0x%2Fproduction%2F4388988d5cca249fe58427ceb13f512ea3eee54a-2648x1064.png\&w=3840)

![Image](https://cdn.dribbble.com/userupload/37567198/file/original-672ae3ecb9ce0a218d4443ac0c8a0d4e.jpg)

---

## 1. Objetivo da Feature

Permitir que qualquer pessoa, **sem necessidade de cadastro**, resgate um GiftPix recebido, informando o **código secreto** e sua **chave Pix**, recebendo o valor de forma **segura, rápida e transparente**.

---

## 2. Público-Alvo

* Pessoa que recebeu um GiftPix
* Usuário não cadastrado
* Usuário em dispositivo móvel (principal)

---

## 3. Princípios de Design

* Zero fricção
* Linguagem simples
* Fluxo curto (≤ 30 segundos)
* Segurança explícita
* Mobile-first

---

## 4. Acesso à Feature

* Via QR Code
* Via link direto

```
https://giftpix.com/r/{gift_id}
```

---

## 5. Fluxo Geral do Resgate

```text
Escanear QR Code
   ↓
Informar código secreto
   ↓
Informar chave Pix
   ↓
Confirmar resgate
   ↓
Receber Pix
```

---

## 6. Estrutura da Feature (MVP)

### 6.1 Tela 1 — Boas-vindas

**Objetivo:** Contextualizar o presenteado

**Conteúdo:**

* Logo GiftPix
* Mensagem:

  > “Você recebeu um GiftPix 🎁”
* Exibição do valor (sem permitir ação)
* CTA:

  * **Resgatar GiftPix**

---

### 6.2 Tela 2 — Validação do Código Secreto

**Campos:**

* Código secreto (input)

**Regras:**

* Obrigatório
* Número limitado de tentativas
* Mensagem genérica em caso de erro

---

### 6.3 Tela 3 — Informar Chave Pix

**Campos:**

* Tipo de chave Pix:

  * CPF/CNPJ
  * E-mail
  * Telefone
  * Chave aleatória
* Valor exibido (somente leitura)

**Validações:**

* Formato da chave
* Máscara dinâmica
* Confirmação visual

---

### 6.4 Tela 4 — Confirmação do Resgate

**Resumo exibido:**

* Valor
* Chave Pix
* Avisos:

  * Operação irreversível
  * Uso único

**Ação:**

* Botão **Confirmar resgate**

---

### 6.5 Tela 5 — Resgate Concluído

**Mensagem:**

> “Pix enviado com sucesso 🎉”

**Informações:**

* Valor recebido
* Data e hora
* Prazo para aparecer no banco (imediato)

---

## 7. Estados Possíveis

### 7.1 Gift Ativo

* Fluxo normal

### 7.2 Gift Já Resgatado

Mensagem:

> “Este GiftPix já foi resgatado.”

### 7.3 Gift Expirado

Mensagem:

> “Este GiftPix expirou.”

### 7.4 Código Inválido

Mensagem genérica:

> “Código inválido. Verifique e tente novamente.”

---

## 8. Regras de Negócio

* GiftPix só pode ser resgatado uma vez
* Código secreto obrigatório
* GiftPix expirado não pode ser resgatado
* Chave Pix informada não é armazenada permanentemente
* Operação é atômica

---

## 9. Segurança

* Rate limit por IP
* Bloqueio temporário após tentativas inválidas
* Token temporário de resgate
* Logs de auditoria
* Chave Pix mascarada em logs

---

## 10. Requisitos Técnicos

### Backend

* `POST /gifts/{id}/validate-code`
* `POST /gifts/{id}/redeem`

### Frontend

* Página pública
* Sem autenticação
* Proteção contra bots

---

## 11. Dados Processados (Exemplo)

```json
{
  "giftId": "uuid",
  "pixKey": "email@exemplo.com",
  "redeemedAt": "2025-01-15T10:30:00Z"
}
```

---

## 12. Critérios de Aceite

✅ Não exige cadastro
✅ Fluxo simples e rápido
✅ Chave Pix validada
✅ Pix enviado corretamente
✅ Mensagens claras de erro

---

## 13. Riscos

* Tentativas de força bruta
* Engenharia social
* Erro de chave Pix
* Instabilidade do PSP

---

## 14. Evoluções Futuras

* Aviso ao presenteador
* Confirmação por SMS/e-mail
* Seleção de banco
* Histórico para presenteado
* KYC leve para valores altos

---

## 15. Resumo Executivo

> **O resgate do GiftPix entrega o momento mais importante do produto: receber o presente de forma simples, segura e imediata via Pix.**

---

## ✅ Fluxo Core do MVP — Completo

✔️ Landing
✔️ Cadastro/Login
✔️ Home Logada
✔️ Criação do GiftPix
✔️ Detalhes do GiftPix
✔️ **Resgate do GiftPix**

---

👉 Próximo passo recomendado:

* **Feature: Notificações**
* **Modelo de dados completo**
* **Fluxo antifraude**
* **Checklist regulatório Pix**

Como prefere continuar?
