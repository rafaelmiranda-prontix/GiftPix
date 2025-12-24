# 🎄 Página de Natal - Instruções 🎄

## Como Usar

### 1. Acessar a Página

Após iniciar o servidor, acesse:
- **Local**: `http://localhost:3000/natal`
- **Produção (Render)**: `https://seu-app.onrender.com/natal`

### 2. Configurar API Key

A página precisa de uma API Key para gerar o QR Code. Você tem duas opções:

#### Opção A: Via URL (Recomendado)
Adicione a API Key como parâmetro na URL:
```
http://localhost:3000/natal?api_key=SUA_CHAVE_SECRETA
```

#### Opção B: Editar o HTML
Edite o arquivo `public/natal.html` e altere a função `getApiKey()`:
```javascript
function getApiKey() {
    return 'SUA_CHAVE_SECRETA_AQUI';
}
```

### 3. Como Funciona

1. **Acesse a página** `/natal`
2. **Digite a chave PIX** da pessoa que vai receber o presente
3. **Clique em "Gerar QR Code do Presente"**
4. **O QR Code será exibido** na tela
5. **Imprima ou mostre o QR Code** para suas sobrinhas escanearem

### 4. Quando o QR Code é Escaneado

Quando alguém escanear o QR Code:
- A URL aponta para `/api/natal/pix?chave_pix=...&valor=300.00`
- O sistema processa automaticamente o PIX de **R$ 300,00**
- A transferência é enviada para a chave PIX informada

### 5. Segurança

- A rota `/api/natal/pix` aceita **apenas valores de R$ 300,00**
- Não é possível alterar o valor através do QR Code
- A geração do QR Code ainda requer API Key

### 6. Gerar QR Code para Imprimir

Você pode gerar o QR Code e:
- **Imprimir** para dar de presente
- **Enviar por WhatsApp** para suas sobrinhas
- **Compartilhar** via link

### 7. Exemplo de Uso

1. Acesse: `http://localhost:3000/natal?api_key=sua_chave`
2. Digite a chave PIX: `sobrinha@email.com`
3. Clique em "Gerar QR Code"
4. Imprima ou compartilhe o QR Code
5. Quando escaneado, o PIX de R$ 300,00 será enviado automaticamente!

## Personalização

Você pode personalizar a página editando `public/natal.html`:
- Alterar o valor (padrão: R$ 300,00)
- Alterar cores e design
- Adicionar mensagens personalizadas

**Nota**: Se alterar o valor, também precisa atualizar a validação em `src/routes/index.ts` na rota `/api/natal/pix`.

## Troubleshooting

### QR Code não gera
- Verifique se a API Key está correta
- Verifique se o servidor está rodando
- Verifique os logs do servidor

### Erro ao escanear QR Code
- Verifique se a chave PIX é válida
- Verifique se o valor é exatamente R$ 300,00
- Verifique os logs do servidor

### PIX não é enviado
- Verifique as credenciais do provedor (Asaas/PagBank)
- Verifique se há saldo suficiente
- Verifique os logs do servidor

## Feliz Natal! 🎄🎁

