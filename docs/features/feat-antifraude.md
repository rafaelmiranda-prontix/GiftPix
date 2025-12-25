

# 🛡️ Feature — Antifraude (MVP)

**Produto:** GiftPix
**Tipo:** Feature de Segurança & Risco
**Prioridade:** Alta (obrigatória)
**Status:** Planejada (MVP)

![Image](https://www.crossclassify.com/images/articles/fintech-fraud-hierarchy/fintech-fraud-hierarchy-hero-image.png)

![Image](https://corefy.com/user/pages/03.blog/building-an-antifraud-system-a-step-by-step-guide/Building_an_antifraud_system_from_scratch_where_to_start_scheme.png)

![Image](https://framerusercontent.com/images/gfYUp51ZmD5qClz0EIenDFtGNG8.jpg?height=1260\&width=2400)

---

## 1. Objetivo da Feature

Reduzir riscos de **fraude, abuso e uso indevido** do GiftPix, protegendo:

* O presenteador
* O presenteado
* A plataforma
* O PSP parceiro

Sem adicionar fricção excessiva ao MVP.

---

## 2. Ameaças Consideradas (MVP)

### Principais vetores de fraude

* Tentativas de brute force no código secreto
* Criação massiva de GiftPix para lavagem
* Uso indevido de cartões Pix
* Resgates automatizados (bots)
* Abuso de estorno
* Engenharia social

---

## 3. Princípios do Antifraude no MVP

* 🔹 Invisível para o usuário legítimo
* 🔹 Baseado em regras (rule-based)
* 🔹 Baixa latência
* 🔹 Integrado ao fluxo existente
* 🔹 Evolutivo para score e ML

---

## 4. Estratégia de Antifraude (MVP)

### Camadas de Proteção

1. **Prevenção**
2. **Detecção**
3. **Reação**
4. **Auditoria**

---

## 5. Regras Antifraude — MVP

### 5.1 Limites por Usuário (Presenteador)

| Regra                         | Valor Inicial |
| ----------------------------- | ------------- |
| Gifts por dia                 | 5             |
| Valor máximo por dia          | R$ 2.000      |
| Valor máximo por gift         | R$ 1.000      |
| Tentativas de pagamento falho | 3             |

📌 Configurável via banco (`system_config`)

---

### 5.2 Proteção no Resgate (Presenteado)

| Regra                | Comportamento         |
| -------------------- | --------------------- |
| Tentativas de código | Máx. 5                |
| Falhas consecutivas  | Bloqueio temporário   |
| Rate limit por IP    | Ativo                 |
| Captcha              | Somente após suspeita |

---

### 5.3 Regras de Estorno

* Estorno automático **apenas** se:

  * Gift nunca foi resgatado
  * Dentro da política configurada
* Bloqueio de estornos em massa
* Estorno manual somente via suporte (futuro)

---

## 6. Score de Risco (MVP Simples)

### Cálculo Básico

Cada evento soma pontos de risco.

| Evento                         | Score |
| ------------------------------ | ----- |
| Muitas tentativas de código    | +30   |
| Criação rápida de vários gifts | +40   |
| IP suspeito                    | +50   |
| Pix falhou                     | +20   |

### Classificação

| Score | Ação          |
| ----- | ------------- |
| < 50  | Normal        |
| 50–80 | Monitorar     |
| > 80  | Bloquear ação |

---

## 7. Ações Automáticas

### Quando risco alto:

* Bloquear criação de novos GiftPix
* Bloquear resgate temporariamente
* Registrar alerta interno
* Mensagem genérica ao usuário

Mensagem exemplo:

> “Não foi possível concluir esta ação no momento. Tente novamente mais tarde.”

---

## 8. Impacto nas Features Existentes

### Criação de GiftPix

* Validação antifraude antes do pagamento
* Possível bloqueio silencioso

### Resgate de GiftPix

* Validação antifraude antes do Pix
* Captcha condicional
* Bloqueio por IP / fingerprint

### Estorno

* Validação antifraude antes de executar Pix de retorno

---

## 9. Dados Persistidos

### Tabela `fraud_events`

| Campo      | Tipo      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| gift_id    | UUID      |
| event_type | string    |
| risk_score | integer   |
| ip         | string    |
| created_at | timestamp |

---

### Tabela `fraud_blocks`

| Campo       | Tipo      |
| ----------- | --------- |
| entity_type | user / ip |
| entity_id   | string    |
| reason      | string    |
| expires_at  | timestamp |

---

## 10. Requisitos Técnicos

### Backend

* Serviço `FraudService`
* Middleware antifraude
* Avaliação síncrona (criação/resgate)
* Logs estruturados

### Infra

* Rate limit global
* Proteção contra bots
* Headers de segurança

---

## 11. Critérios de Aceite

✅ Tentativas de brute force bloqueadas
✅ Limites diários aplicados
✅ Resgates suspeitos interrompidos
✅ Nenhum dado sensível exposto
✅ Logs antifraude disponíveis

---

## 12. Riscos

* Falso positivo
* Usuário legítimo bloqueado
* Regras mal calibradas
* Dependência excessiva de IP

---

## 13. Evoluções Futuras

* Score comportamental
* Device fingerprint
* Integração com antifraude externo
* ML / IA
* KYC progressivo
* Monitoramento em tempo real

---

## 14. Resumo Executivo

> **O Antifraude do GiftPix protege a plataforma de abusos e fraudes desde o MVP, usando regras simples, eficazes e evolutivas, sem prejudicar a experiência do usuário legítimo.**

---

## 🧭 Próximas Features Recomendadas

Agora o GiftPix está **robusto como fintech**. Próximo passo lógico:

1. **Feature: Histórico & Relatórios (com status Pix + estorno)**
2. Feature: Configurações do Sistema
3. Feature: B2B / Corporativo
4. Feature: Suporte & Disputas
5. Branding & Naming (validar GiftPix)

👉 Qual seguimos agora?
