# Exemplos de Uso - Gift PIX Payout

Este arquivo contém exemplos práticos de como usar a API.

## Configuração Inicial

Certifique-se de ter configurado o arquivo `.env` com suas credenciais:

```bash
cp .env.example .env
# Edite .env com suas credenciais reais
```

## 1. Testando a API

### Verificar se a API está funcionando

```bash
curl http://localhost:3000/api/health
```

## 2. Enviando um PIX

### Exemplo básico

```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 10.00,
    "descricao": "Teste de pagamento"
  }'
```

### Com ID de transação customizado (idempotência)

```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 10.00,
    "descricao": "Teste de pagamento",
    "id_transacao": "meu-id-unico-123"
  }'
```

### Diferentes tipos de chaves PIX

#### CPF
```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "12345678901",
    "valor": 50.00,
    "descricao": "Pagamento via CPF"
  }'
```

#### CNPJ
```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "12345678000190",
    "valor": 100.00,
    "descricao": "Pagamento via CNPJ"
  }'
```

#### Telefone
```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "+5511999999999",
    "valor": 25.00,
    "descricao": "Pagamento via telefone"
  }'
```

#### Chave aleatória
```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "123e4567-e89b-12d3-a456-426614174000",
    "valor": 75.00,
    "descricao": "Pagamento via chave aleatória"
  }'
```

## 3. Consultando Transações

### Consultar status de uma transação específica

```bash
# Substitua 'reference-id-aqui' pelo reference_id retornado na criação
curl -H "x-api-key: your_secret_key_here_change_in_production" \
  http://localhost:3000/api/pix-payout/reference-id-aqui
```

### Listar todas as transações

```bash
curl -H "x-api-key: your_secret_key_here_change_in_production" \
  http://localhost:3000/api/pix-payout
```

## 4. Gerando QR Codes

### Gerar QR Code (retorna JSON com base64)

```bash
curl -X POST http://localhost:3000/api/qrcode/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 50.00,
    "descricao": "QR Code para pagamento"
  }'
```

### Gerar QR Code (retorna imagem PNG)

```bash
curl -H "x-api-key: your_secret_key_here_change_in_production" \
  "http://localhost:3000/api/qrcode/image?chave_pix=exemplo@exemplo.com&valor=50.00&descricao=Teste" \
  --output qrcode.png
```

## 5. Exemplos em JavaScript/Node.js

### Usando Fetch

```javascript
async function enviarPIX() {
  const response = await fetch('http://localhost:3000/api/pix-payout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your_secret_key_here_change_in_production'
    },
    body: JSON.stringify({
      chave_pix: 'exemplo@exemplo.com',
      valor: 100.00,
      descricao: 'Pagamento teste'
    })
  });

  const result = await response.json();

  if (result.success) {
    console.log('PIX enviado com sucesso!');
    console.log('ID da transação:', result.data.transaction.reference_id);
  } else {
    console.error('Erro:', result.error.message);
  }
}

enviarPIX();
```

### Usando Axios

```javascript
const axios = require('axios');

async function enviarPIX() {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/pix-payout',
      {
        chave_pix: 'exemplo@exemplo.com',
        valor: 100.00,
        descricao: 'Pagamento teste'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'your_secret_key_here_change_in_production'
        }
      }
    );

    console.log('PIX enviado com sucesso!');
    console.log('Dados:', response.data);
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

enviarPIX();
```

### Gerar e Exibir QR Code em HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Gerador de QR Code PIX</title>
</head>
<body>
  <h1>Gerador de QR Code para Pagamento PIX</h1>

  <form id="qrForm">
    <label>Chave PIX:</label>
    <input type="text" id="chave_pix" required>
    <br><br>

    <label>Valor:</label>
    <input type="number" id="valor" step="0.01" required>
    <br><br>

    <label>Descrição:</label>
    <input type="text" id="descricao">
    <br><br>

    <button type="submit">Gerar QR Code</button>
  </form>

  <div id="result"></div>

  <script>
    document.getElementById('qrForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        chave_pix: document.getElementById('chave_pix').value,
        valor: parseFloat(document.getElementById('valor').value),
        descricao: document.getElementById('descricao').value
      };

      const response = await fetch('http://localhost:3000/api/qrcode/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'your_secret_key_here_change_in_production'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        document.getElementById('result').innerHTML = `
          <h2>QR Code Gerado:</h2>
          <img src="${result.data.qrcode}" alt="QR Code">
          <p>URL: <a href="${result.data.url}">${result.data.url}</a></p>
        `;
      } else {
        document.getElementById('result').innerHTML = `
          <p style="color: red;">Erro: ${result.error.message}</p>
        `;
      }
    });
  </script>
</body>
</html>
```

## 6. Exemplos em Python

```python
import requests

API_URL = "http://localhost:3000/api"
API_KEY = "your_secret_key_here_change_in_production"

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}

# Enviar PIX
def enviar_pix(chave_pix, valor, descricao=""):
    data = {
        "chave_pix": chave_pix,
        "valor": valor,
        "descricao": descricao
    }

    response = requests.post(
        f"{API_URL}/pix-payout",
        json=data,
        headers=headers
    )

    return response.json()

# Gerar QR Code
def gerar_qrcode(chave_pix, valor, descricao=""):
    data = {
        "chave_pix": chave_pix,
        "valor": valor,
        "descricao": descricao
    }

    response = requests.post(
        f"{API_URL}/qrcode/generate",
        json=data,
        headers=headers
    )

    return response.json()

# Exemplo de uso
resultado = enviar_pix("exemplo@exemplo.com", 50.00, "Pagamento teste")
print(resultado)

qrcode = gerar_qrcode("exemplo@exemplo.com", 50.00, "QR Code teste")
print(qrcode)
```

## 7. Testando Idempotência

```bash
# Primeira requisição
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 100.00,
    "id_transacao": "teste-idempotencia-123"
  }'

# Segunda requisição (mesmo id_transacao)
# Deve retornar a mesma transação sem criar uma nova
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 100.00,
    "id_transacao": "teste-idempotencia-123"
  }'
```

## 8. Tratamento de Erros

### Chave PIX inválida

```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "invalido",
    "valor": 100.00
  }'
```

Resposta:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Chave PIX inválida. Deve ser CPF, CNPJ, e-mail, telefone ou chave aleatória"
  }
}
```

### Valor abaixo do mínimo

```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 0.50
  }'
```

### API Key inválida

```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: chave_errada" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 100.00
  }'
```

## 9. Monitoramento e Logs

Os logs são salvos em `logs/combined.log` e `logs/error.log`. Para visualizar em tempo real:

```bash
# Todos os logs
tail -f logs/combined.log

# Apenas erros
tail -f logs/error.log
```

## 10. Fluxo Completo - Caso de Uso Real

```bash
# 1. Gerar QR Code
curl -X POST http://localhost:3000/api/qrcode/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_key_here_change_in_production" \
  -d '{
    "chave_pix": "fornecedor@empresa.com",
    "valor": 500.00,
    "descricao": "Pagamento de serviços - Janeiro/2024"
  }' | jq -r '.data.qrcode' > qrcode.txt

# 2. O usuário escaneia o QR Code (ou acessa o link)
# 3. A requisição é enviada automaticamente

# 4. Consultar status da transação
curl -H "x-api-key: your_secret_key_here_change_in_production" \
  http://localhost:3000/api/pix-payout/reference-id-retornado
```

---

Esses exemplos cobrem os principais casos de uso da API. Para mais informações, consulte o [README.md](README.md).
