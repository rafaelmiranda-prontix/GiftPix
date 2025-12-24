# Gift PIX Payout - MVP

Sistema de integração de payouts PIX via requisição de QR Code com **Asaas** ou **PagBank**.

## Descrição

Esta aplicação permite processar pagamentos PIX automaticamente através de requisições HTTP geradas por QR Codes. Ao escanear um QR Code ou acessar um link personalizado, a aplicação processa a solicitação e envia um PIX para a chave especificada.

### Provedores Suportados

- ✅ **Asaas** (Recomendado) - API completa de transferências PIX
- ✅ **PagBank** (PagSeguro) - Transferências PIX

Você pode alternar entre provedores configurando a variável `PAYMENT_PROVIDER` no arquivo `.env`.

## Funcionalidades

- ✅ **Multi-provider**: Suporte a Asaas e PagBank
- ✅ Processamento de payouts PIX
- ✅ Geração de QR Codes com links parametrizados
- ✅ Validação de chaves PIX (CPF, CNPJ, e-mail, telefone, chave aleatória)
- ✅ Validação de valores e limites configuráveis
- ✅ Idempotência de transações (prevenção de duplicatas)
- ✅ Autenticação via API Key
- ✅ Rate limiting para proteção contra abusos
- ✅ Logs estruturados com Winston
- ✅ Tratamento de erros robusto

## Tecnologias

- **Backend**: Node.js + TypeScript
- **Framework**: Express.js
- **Provedores PIX**: Asaas, PagBank
- **Segurança**: Helmet, CORS, Rate Limiting
- **Logs**: Winston
- **QR Code**: qrcode

## Pré-requisitos

- Node.js >= 18.x
- Conta em um dos provedores:
  - **Asaas** (recomendado): [asaas.com](https://www.asaas.com) - Veja [ASAAS_SETUP.md](ASAAS_SETUP.md)
  - **PagBank**: [pagseguro.uol.com.br](https://pagseguro.uol.com.br)

## Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd gift_pix
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

#### Opção A: Usando Asaas (Recomendado)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Payment Provider
PAYMENT_PROVIDER=asaas

# Asaas API Configuration
ASAAS_API_URL=https://sandbox.asaas.com/api
ASAAS_API_KEY=sua_api_key_aqui

# Security
API_SECRET_KEY=sua_chave_secreta_aqui

# Transaction Limits
MIN_PIX_VALUE=1.00
MAX_PIX_VALUE=10000.00

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
```

**📖 Guia completo de configuração Asaas**: [ASAAS_SETUP.md](ASAAS_SETUP.md)

#### Opção B: Usando PagBank

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Payment Provider
PAYMENT_PROVIDER=pagbank

# PagBank API Configuration
PAGBANK_API_URL=https://sandbox.api.pagseguro.com
PAGBANK_API_TOKEN=seu_token_aqui
PAGBANK_EMAIL=seu_email@pagseguro.com

# Security
API_SECRET_KEY=sua_chave_secreta_aqui

# Transaction Limits
MIN_PIX_VALUE=1.00
MAX_PIX_VALUE=10000.00
```

### 4. Compile o TypeScript

```bash
npm run build
```

## Uso

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## Endpoints da API

Todos os endpoints (exceto `/` e `/api/health`) requerem autenticação via header `x-api-key`.

### 1. Health Check

```http
GET /api/health
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-12-24T20:00:00.000Z"
  }
}
```

### 2. Criar Payout PIX

```http
POST /api/pix-payout
Content-Type: application/json
x-api-key: sua_api_key

{
  "chave_pix": "exemplo@exemplo.com",
  "valor": 100.00,
  "descricao": "Pagamento Teste",
  "id_transacao": "opcional-uuid"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "message": "PIX enviado com sucesso",
    "transaction": {
      "id": "uuid",
      "reference_id": "uuid",
      "pagbank_transaction_id": "pagbank-id",
      "status": "COMPLETED",
      "chave_pix": "exemplo@exemplo.com",
      "valor": 100.00,
      "created_at": "2024-12-24T20:00:00.000Z"
    }
  }
}
```

### 3. Consultar Status de Transação

```http
GET /api/pix-payout/:referenceId
x-api-key: sua_api_key
```

### 4. Listar Todas as Transações

```http
GET /api/pix-payout
x-api-key: sua_api_key
```

### 5. Gerar QR Code

```http
POST /api/qrcode/generate
Content-Type: application/json
x-api-key: sua_api_key

{
  "chave_pix": "exemplo@exemplo.com",
  "valor": 100.00,
  "descricao": "Pagamento Teste"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "qrcode": "data:image/png;base64,...",
    "url": "http://localhost:3000/api/pix-payout?chave_pix=exemplo@exemplo.com&valor=100.00",
    "message": "QR Code gerado com sucesso"
  }
}
```

### 6. Obter QR Code como Imagem

```http
GET /api/qrcode/image?chave_pix=exemplo@exemplo.com&valor=100.00&descricao=Teste
x-api-key: sua_api_key
```

Retorna uma imagem PNG diretamente.

## Validações

### Chave PIX

A aplicação aceita os seguintes formatos de chave PIX:

- **CPF**: 11 dígitos (ex: `12345678901`)
- **CNPJ**: 14 dígitos (ex: `12345678000190`)
- **E-mail**: formato válido (ex: `usuario@exemplo.com`)
- **Telefone**: formato +55DDNNNNNNNNN (ex: `+5511999999999`)
- **Chave Aleatória**: formato UUID (ex: `123e4567-e89b-12d3-a456-426614174000`)

### Valor

- Mínimo: R$ 1,00 (configurável)
- Máximo: R$ 10.000,00 (configurável)
- Máximo 2 casas decimais

## Segurança

### Autenticação

Todas as rotas protegidas requerem o header `x-api-key`:

```bash
curl -H "x-api-key: sua_chave_secreta" http://localhost:3000/api/health
```

### Rate Limiting

Por padrão, limite de 100 requisições por 15 minutos por IP.

### HTTPS

Em produção, sempre use HTTPS. Configure um reverse proxy (nginx, Cloudflare, etc.).

### Variáveis de Ambiente

Nunca commite o arquivo `.env`. Use serviços como AWS Secrets Manager ou similar em produção.

## Configuração do PagBank

### 1. Criar Conta

Acesse [PagBank](https://pagseguro.uol.com.br/) e crie uma conta PJ (Pessoa Jurídica).

### 2. Obter Credenciais

1. Acesse o dashboard do PagBank
2. Vá em **Integrações** > **Credenciais**
3. Gere um token de API
4. Configure o ambiente (sandbox para testes, produção para uso real)

### 3. Documentação

- [Developer PagBank](https://developer.pagbank.com.br/)
- [API de Transferências](https://developer.pagbank.com.br/reference/criar-transferencia)

## Logs

Os logs são salvos em:

- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

Exemplo de log:

```json
{
  "timestamp": "2024-12-24 20:00:00",
  "level": "info",
  "message": "Processing payout request",
  "reference_id": "uuid",
  "chave_pix": "exemplo@exemplo.com",
  "valor": 100
}
```

## Tratamento de Erros

### Erro de Validação

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Chave PIX inválida"
  }
}
```

### Erro do PagBank

```json
{
  "success": false,
  "error": {
    "code": "PAGBANK_ERROR",
    "message": "PagBank API Error: 400",
    "details": { ... }
  }
}
```

### Erro Interno

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Erro interno do servidor"
  }
}
```

## Idempotência

A aplicação garante idempotência através do campo `id_transacao`. Se você enviar uma requisição com o mesmo `id_transacao`, ela retornará a transação existente sem criar uma nova.

```bash
# Primeira requisição
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave" \
  -d '{"chave_pix":"teste@teste.com","valor":50,"id_transacao":"meu-id-unico"}'

# Segunda requisição (retorna a mesma transação)
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave" \
  -d '{"chave_pix":"teste@teste.com","valor":50,"id_transacao":"meu-id-unico"}'
```

## Exemplos de Uso

### cURL

```bash
# Criar payout
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave_secreta" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 100.00,
    "descricao": "Pagamento Teste"
  }'

# Gerar QR Code
curl -X POST http://localhost:3000/api/qrcode/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave_secreta" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 50.00,
    "descricao": "QR Code Teste"
  }'
```

### JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/api/pix-payout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'sua_chave_secreta'
  },
  body: JSON.stringify({
    chave_pix: 'exemplo@exemplo.com',
    valor: 100.00,
    descricao: 'Pagamento Teste'
  })
});

const result = await response.json();
console.log(result);
```

## Ambiente de Teste (Sandbox)

Use a URL de sandbox do PagBank para testes:

```env
PAGBANK_API_URL=https://sandbox.api.pagseguro.com
```

Não serão realizadas transferências reais neste ambiente.

## Deploy

### Docker (Recomendado)

Crie um `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

Build e execute:

```bash
docker build -t gift-pix-payout .
docker run -p 3000:3000 --env-file .env gift-pix-payout
```

### Heroku

```bash
heroku create gift-pix-payout
heroku config:set PAGBANK_API_TOKEN=seu_token
heroku config:set API_SECRET_KEY=sua_chave
git push heroku main
```

### AWS/GCP/Azure

Use serviços como:
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service

## Limitações do MVP

- Armazenamento em memória (transações são perdidas ao reiniciar)
- Não há webhook de status do PagBank
- Não há interface web (apenas API)
- Certificado digital não implementado (se necessário)

## Melhorias Futuras

- [ ] Adicionar banco de dados (PostgreSQL/MongoDB)
- [ ] Implementar webhooks do PagBank para status
- [ ] Adicionar interface web de gerenciamento
- [ ] Implementar testes automatizados
- [ ] Adicionar retry automático para falhas temporárias
- [ ] Implementar queue system (RabbitMQ/Redis) para processamento assíncrono
- [ ] Adicionar suporte a múltiplas contas PagBank
- [ ] Dashboard de analytics e relatórios

## Suporte

Para problemas ou dúvidas, consulte:
- [Documentação PagBank](https://developer.pagbank.com.br/docs)
- [Status da API PagBank](https://status.pagseguro.uol.com.br/)

## Licença

MIT

---

Desenvolvido para integração de payouts PIX via QR Code com PagSeguro/PagBank.
