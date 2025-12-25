# Debug - QR Code não está sendo gerado

## Checklist de Verificação

### 1. Verificar API Key
- [ ] A API Key está configurada corretamente na URL: `/natal?api_key=SUA_CHAVE`
- [ ] Ou está configurada no código HTML (linha 413)
- [ ] A API Key corresponde à variável `API_SECRET_KEY` do servidor

### 2. Verificar Console do Navegador
Abra o console do navegador (F12) e verifique:
- [ ] Se há erros de CORS
- [ ] Se há erros de autenticação (401/403)
- [ ] Se há erros de rede
- [ ] Qual é a resposta completa da API

### 3. Verificar Servidor
Verifique os logs do servidor:
```bash
# Ver logs em tempo real
tail -f logs/combined.log
```

Procure por:
- [ ] Requisições chegando em `/api/qrcode/generate`
- [ ] Erros de validação
- [ ] Erros de autenticação

### 4. Testar Endpoint Diretamente

Teste o endpoint com curl:

```bash
curl -X POST http://localhost:3000/api/qrcode/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE_AQUI" \
  -d '{
    "chave_pix": "teste@exemplo.com",
    "valor": 300.00,
    "descricao": "Presente de Natal"
  }'
```

### 5. Verificar Validações

O QR Code só será gerado se:
- [ ] Chave PIX é válida (CPF, CNPJ, e-mail, telefone ou chave aleatória)
- [ ] Valor é 300.00 (para usar rota de Natal)
- [ ] Descrição contém "natal" ou "presente" (case insensitive)
- [ ] API Key está correta

### 6. Problemas Comuns

#### Erro 401 (Unauthorized)
- API Key incorreta ou não fornecida
- Verifique se o header `x-api-key` está sendo enviado

#### Erro 400 (Bad Request)
- Chave PIX inválida
- Valor inválido
- Verifique os logs do servidor para detalhes

#### Erro 500 (Internal Server Error)
- Erro ao gerar QR Code
- Verifique se o módulo `qrcode` está instalado
- Verifique os logs do servidor

#### CORS Error
- Verifique se a URL da API está correta
- Verifique configuração de CORS no servidor

### 7. Teste Manual

1. Abra a página: `http://localhost:3000/natal?api_key=SUA_CHAVE`
2. Abra o console do navegador (F12)
3. Digite uma chave PIX válida
4. Clique em "Gerar QR Code"
5. Veja o que aparece no console

### 8. Verificar Resposta da API

A resposta esperada deve ser:
```json
{
  "success": true,
  "data": {
    "qrcode": "data:image/png;base64,...",
    "url": "http://localhost:3000/api/natal/pix?...",
    "message": "QR Code gerado com sucesso"
  }
}
```

Se `success` for `false`, verifique o campo `error`.

## Solução Rápida

Se nada funcionar, teste diretamente:

1. **Teste o endpoint:**
```bash
curl -X POST http://localhost:3000/api/qrcode/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave" \
  -d '{"chave_pix":"teste@teste.com","valor":300.00,"descricao":"Presente de Natal"}'
```

2. **Se funcionar, o problema está no frontend**
   - Verifique a API Key na URL
   - Verifique o console do navegador
   - Verifique se a URL da API está correta

3. **Se não funcionar, o problema está no backend**
   - Verifique os logs do servidor
   - Verifique se a API Key está correta
   - Verifique se as dependências estão instaladas

