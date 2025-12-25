
# 📊 Feature — Histórico & Relatórios (com Status Pix e Estorno)

**Produto:** GiftPix
**Tipo:** Feature de Gestão & Transparência
**Prioridade:** Alta (MVP+)
**Status:** Planejada

![Image](https://cdn.dribbble.com/userupload/11784545/file/original-5f14cb4d24873a1b63104b47b0997654.png?format=webp\&resize=400x300\&vertical=center)

![Image](https://cdn.dribbble.com/userupload/13012896/file/original-77a23668077dc4d081571f8fd5ef7782.png)

![Image](https://slidemodel.com/wp-content/uploads/20608-01-fintech-industry-powerpoint-templates-16x9-27.jpg)

---

## 1. Objetivo da Feature

Permitir que o usuário visualize **todo o histórico financeiro dos seus GiftPix**, com **status claros**, incluindo:

* Criação
* Resgate
* Processamento do Pix
* Conclusão do Pix
* Estornos

Essa feature reduz dúvidas, suporte e aumenta a **confiança na plataforma**.

---

## 2. Público-Alvo

* Usuário autenticado (presenteador)
* Usuários recorrentes
* Usuários que movimentam valores com frequência

---

## 3. Princípios de Design

* Clareza > volume de dados
* Status financeiros explícitos
* Visual escaneável
* Mobile-first
* Linguagem não técnica

---

## 4. Acesso à Feature

* A partir da **Home Logada**
* Menu: **Histórico**
* URL:

```
/history
```

---

## 5. Estrutura da Tela (MVP)

### 5.1 Resumo Financeiro (Topo)

**Objetivo:** Visão rápida

Cards:

* 🎁 Total de GiftPix criados
* 💰 Valor total enviado
* ✅ Pix concluídos
* 🔄 Valores estornados

---

### 5.2 Lista de GiftPix (Histórico)

**Formato:** Lista / tabela responsiva

**Campos exibidos por item:**

* Data de criação
* Valor
* Status do GiftPix
* Status do Pix
* Ação: **Ver detalhes**

---

### 5.3 Status Combinados (UI)

Exemplo visual:

| GiftPix   | Pix        | Significado          |
| --------- | ---------- | -------------------- |
| ATIVO     | —          | Aguardando resgate   |
| RESGATADO | PROCESSING | Pix em processamento |
| RESGATADO | COMPLETED  | Pix concluído        |
| ATIVO     | REFUNDED   | Estornado            |
| EXPIRED   | —          | Expirado sem resgate |

---

### 5.4 Filtros (MVP Simples)

* Status do GiftPix
* Período (últimos 7 / 30 / 90 dias)

---

## 6. Detalhe Expandido (Via Detalhes do GiftPix)

Ao clicar em **Ver detalhes**, reutiliza a feature:
➡️ **Detalhes do GiftPix**, agora com:

* Linha do tempo financeira
* Status do Pix
* Evento de estorno (se houver)

---

## 7. Linha do Tempo (Timeline)

**Exemplo:**

```
10/01 — GiftPix criado
10/01 — Pagamento confirmado
12/01 — GiftPix resgatado
12/01 — Pix em processamento
12/01 — Pix concluído
```

Ou, em caso de estorno:

```
10/01 — GiftPix criado
10/02 — GiftPix expirado
10/02 — Estorno realizado
```

---

## 8. Regras de Negócio

* Histórico é **imutável**
* Eventos financeiros não podem ser editados
* Dados exibidos apenas ao dono da conta
* Status Pix vem sempre do PSP (fonte de verdade)

---

## 9. Requisitos Funcionais

* Listar GiftPix do usuário
* Exibir status do GiftPix
* Exibir status do Pix
* Exibir estornos
* Aplicar filtros simples
* Navegar para detalhes

---

## 10. Requisitos Não Funcionais

* Performance (paginação)
* Consistência de dados
* Segurança (auth obrigatória)
* Disponibilidade

---

## 11. Requisitos Técnicos

### Backend

Endpoints:

```
GET /history
GET /history/summary
```

Resposta resumida:

```json
{
  "summary": {
    "totalGifts": 12,
    "totalSent": 1800,
    "totalRefunded": 300
  },
  "items": [
    {
      "giftId": "uuid",
      "amount": 150,
      "giftStatus": "REDEEMED",
      "pixStatus": "PROCESSING",
      "createdAt": "2025-01-10"
    }
  ]
}
```

---

### Banco de Dados (Relacionamentos)

* `gifts`
* `pix_transactions`
* `refunds`
* `audit_logs`

---

## 12. Critérios de Aceite

✅ Usuário vê histórico completo
✅ Status Pix sempre visível
✅ Estornos claramente identificados
✅ Linha do tempo compreensível
✅ Navegação fluida para detalhes

---

## 13. Riscos

* Inconsistência de status (mitigado via PSP)
* Excesso de informação no MVP
* Confusão entre status do Gift e do Pix

---

## 14. Evoluções Futuras

* Exportar CSV / PDF
* Relatórios mensais
* Dashboard financeiro avançado
* Histórico para presenteado
* Relatórios B2B

---

## 15. Resumo Executivo

> **O Histórico & Relatórios do GiftPix oferece transparência total das operações financeiras, exibindo claramente o status do Pix, estornos e o ciclo completo de cada GiftPix.**

---

## 🧭 Estado atual do produto

Com essa feature, o **MVP do GiftPix está funcional, seguro e auditável**.

### Próximas possíveis evoluções:

1. **Feature: Configurações do Sistema**
2. Feature: B2B / Corporativo
3. Feature: Suporte & Disputas
4. Branding & Naming (validação do nome GiftPix)
5. Roadmap técnico + pitch para investidores

👉 Qual dessas seguimos agora?
