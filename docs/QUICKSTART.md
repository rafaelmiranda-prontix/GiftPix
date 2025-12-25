# Quick Start Guide - Gift PIX Payout

Guia rápido para colocar o projeto em funcionamento.

## 1. Instalar Dependências

```bash
npm install
```

## 2. Configurar Variáveis de Ambiente

O arquivo `.env` já foi criado. Você precisa editar e adicionar suas credenciais:

```bash
# Abra o arquivo .env e configure:

# 1. Token da API PagBank
PAGBANK_API_TOKEN=seu_token_aqui

# 2. E-mail da sua conta PagBank
PAGBANK_EMAIL=seu_email@pagseguro.com

# 3. Chave secreta para API (mude em produção!)
API_SECRET_KEY=uma_chave_secreta_forte_aqui
```

### Como obter as credenciais PagBank:

1. Acesse [https://pagseguro.uol.com.br/](https://pagseguro.uol.com.br/)
2. Faça login na sua conta PJ
3. Vá em **Integrações** > **Credenciais**
4. Gere um token de API
5. Para testes, use o ambiente sandbox: `https://sandbox.api.pagseguro.com`

## 3. Rodar o Projeto

### Modo Desenvolvimento (com hot reload)

```bash
npm run dev
```

### Compilar TypeScript

```bash
npm run build
```

### Modo Produção

```bash
npm start
```

## 4. Testar a API

### Verificar se está funcionando

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-12-24T20:00:00.000Z"
  }
}
```

### Enviar um PIX de teste

```bash
curl -X POST http://localhost:3000/api/pix-payout \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave_secreta_do_env" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 10.00,
    "descricao": "Teste"
  }'
```

### Gerar um QR Code

```bash
curl -X POST http://localhost:3000/api/qrcode/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave_secreta_do_env" \
  -d '{
    "chave_pix": "exemplo@exemplo.com",
    "valor": 50.00,
    "descricao": "QR Code Teste"
  }'
```

## 5. Estrutura do Projeto

```
gift_pix/
├── src/
│   ├── config/          # Configurações e variáveis de ambiente
│   ├── controllers/     # Controladores de rotas
│   ├── middlewares/     # Middlewares (auth, error handling)
│   ├── routes/          # Definição de rotas
│   ├── services/        # Serviços (integração PagBank)
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários (logger, validators, etc)
│   ├── app.ts           # Configuração do Express
│   └── server.ts        # Entry point da aplicação
├── logs/                # Logs da aplicação (criado automaticamente)
├── .env                 # Variáveis de ambiente
├── .env.example         # Exemplo de variáveis de ambiente
├── package.json         # Dependências
├── tsconfig.json        # Configuração TypeScript
├── Dockerfile           # Container Docker
├── README.md            # Documentação completa
├── EXEMPLOS.md          # Exemplos de uso
└── QUICKSTART.md        # Este arquivo
```

## 6. Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/pix-payout` | Criar payout PIX |
| GET | `/api/pix-payout/:id` | Consultar status |
| GET | `/api/pix-payout` | Listar todas transações |
| POST | `/api/qrcode/generate` | Gerar QR Code (JSON) |
| GET | `/api/qrcode/image` | Gerar QR Code (imagem) |

## 7. Autenticação

Todos os endpoints (exceto `/` e `/api/health`) requerem o header:

```
x-api-key: sua_chave_do_env
```

## 8. Verificar Logs

```bash
# Logs gerais
tail -f logs/combined.log

# Apenas erros
tail -f logs/error.log
```

## 9. Próximos Passos

1. **Configure suas credenciais PagBank** no arquivo `.env`
2. **Teste no ambiente sandbox** primeiro
3. **Leia o [README.md](README.md)** para documentação completa
4. **Veja [EXEMPLOS.md](EXEMPLOS.md)** para mais exemplos de uso
5. **Em produção:**
   - Use HTTPS (configure reverse proxy)
   - Mude `API_SECRET_KEY` para algo seguro
   - Configure `NODE_ENV=production`
   - Use banco de dados real (PostgreSQL/MongoDB)

## 10. Problemas Comuns

### Erro: "Environment variable PAGBANK_API_TOKEN is required"

- Configure o token no arquivo `.env`

### Erro: "API key é obrigatória"

- Adicione o header `x-api-key` nas requisições

### Erro: "PagBank API Error"

- Verifique se suas credenciais estão corretas
- Certifique-se de estar usando o ambiente correto (sandbox/produção)
- Verifique se tem saldo na conta PagBank

### Porta 3000 já em uso

- Mude a porta no `.env`: `PORT=3001`

## Suporte

- [Documentação Completa](README.md)
- [Exemplos](EXEMPLOS.md)
- [Documentação PagBank](https://developer.pagbank.com.br/)

---

Pronto para começar! 🚀
