# Checklist de Deploy no Render

Use este checklist para garantir que tudo está configurado corretamente antes do deploy.

## ✅ Pré-Deploy

### Repositório
- [ ] Código commitado e pushado para o repositório Git
- [ ] Branch principal (main/master) está atualizada
- [ ] Arquivo `render.yaml` está no repositório
- [ ] Arquivo `.gitignore` está configurado (não commitar `.env`)

### Variáveis de Ambiente
- [ ] `NODE_ENV=production`
- [ ] `API_SECRET_KEY` gerada e segura (use `openssl rand -hex 32`)
- [ ] Provedor configurado:
  - [ ] `PAYMENT_PROVIDER=asaas` ou `PAYMENT_PROVIDER=pagbank`
  - [ ] Credenciais do provedor configuradas:
    - [ ] Asaas: `ASAAS_API_URL` e `ASAAS_API_KEY`
    - [ ] PagBank: `PAGBANK_API_URL`, `PAGBANK_API_TOKEN` e `PAGBANK_EMAIL`
- [ ] Limites configurados: `MIN_PIX_VALUE` e `MAX_PIX_VALUE`
- [ ] Rate limiting configurado (opcional)
- [ ] CORS configurado: `ALLOWED_ORIGINS` (se necessário)

### Build
- [ ] `npm run build` funciona localmente
- [ ] `npm start` funciona localmente (faz build e inicia)
- [ ] Não há erros de TypeScript
- [ ] Arquivo `dist/server.js` é gerado corretamente

### Testes Locais
- [ ] `npm start` inicia o servidor
- [ ] Health check funciona: `GET /api/health`
- [ ] Autenticação funciona: header `x-api-key`
- [ ] Endpoint de payout funciona (teste com sandbox)

## ✅ Deploy no Render

### Configuração do Serviço
- [ ] Repositório conectado ao Render
- [ ] Tipo de serviço: **Web Service**
- [ ] Environment: **Node**
- [ ] Build Command: `yarn install` (ou `npm install`)
- [ ] Start Command: `yarn start` (ou `npm start`)
- [ ] Health Check Path: `/api/health`

**Nota**: O script `start` executa o build automaticamente antes de iniciar.

### Variáveis de Ambiente no Render
- [ ] Todas as variáveis obrigatórias configuradas
- [ ] Valores não contêm espaços extras
- [ ] Chaves de API estão corretas
- [ ] `PORT` não precisa ser configurado (Render define automaticamente)

### Primeiro Deploy
- [ ] Build completou com sucesso
- [ ] Serviço iniciou sem erros
- [ ] Health check está passando
- [ ] Logs não mostram erros críticos

## ✅ Pós-Deploy

### Testes
- [ ] Health check: `curl https://seu-app.onrender.com/api/health`
- [ ] Autenticação: `curl -H "x-api-key: sua_chave" https://seu-app.onrender.com/api/health`
- [ ] Teste de payout (sandbox): criar uma transação de teste
- [ ] QR Code generation funciona

### Webhooks (se usar Asaas)
- [ ] Webhook de autorização configurado no Asaas:
  - URL: `https://seu-app.onrender.com/api/webhooks/asaas/authorize`
  - Evento: `Transfer.AUTHORIZE`
- [ ] Webhook de notificação configurado no Asaas:
  - URL: `https://seu-app.onrender.com/api/webhooks/asaas/notification`
  - Evento: `Transfer.NOTIFICATION`
- [ ] Teste de webhook (se possível)

### Segurança
- [ ] HTTPS está ativo (automático no Render)
- [ ] `API_SECRET_KEY` é forte e única
- [ ] CORS configurado corretamente (se necessário)
- [ ] Rate limiting está ativo
- [ ] Logs não expõem informações sensíveis

### Monitoramento
- [ ] Logs estão acessíveis no dashboard
- [ ] Métricas básicas estão sendo coletadas
- [ ] Alertas configurados (opcional)

## ✅ Documentação

- [ ] URL da aplicação documentada
- [ ] Variáveis de ambiente documentadas
- [ ] Endpoints documentados
- [ ] Exemplos de uso atualizados com a URL do Render

## 🚨 Problemas Comuns

### Build Falha
- Verificar se todas as dependências estão no `package.json`
- Verificar logs de build no Render
- Testar build localmente: `npm ci && npm run build`

### Serviço Não Inicia
- Verificar se `dist/server.js` existe
- Verificar logs de erro no Render
- Verificar se todas as variáveis obrigatórias estão configuradas

### Health Check Falha
- Verificar se o endpoint `/api/health` está acessível
- Verificar se o servidor está escutando na porta correta
- Aumentar timeout do health check (padrão: 30s)

### Erro de Variáveis de Ambiente
- Verificar se não há espaços extras nos valores
- Verificar se as chaves estão corretas (case-sensitive)
- Verificar se variáveis obrigatórias estão configuradas

### CORS Bloqueando Requisições
- Verificar se `ALLOWED_ORIGINS` está configurado corretamente
- Verificar se a origem da requisição está na lista
- Em desenvolvimento, CORS permite todas as origens

## 📝 Notas

- O Render define automaticamente a variável `PORT`
- O serviço pode "dormir" após 15 minutos de inatividade no plano gratuito
- Use o plano Standard ($7/mês) para evitar sleep
- Monitore os logs regularmente após o deploy

