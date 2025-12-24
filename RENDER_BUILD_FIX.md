# Correção de Build no Render

## Problema

Erros de TypeScript durante o build no Render:
- `Cannot find name 'process'`
- `Cannot find name 'Buffer'`
- `Cannot find name 'URLSearchParams'`
- Falta de tipos do Node.js

## Solução

### 1. Comandos no Render

**Build Command:**
```bash
yarn install && yarn build
```

**Start Command:**
```bash
node dist/server.js
```

### 2. Configuração do render.yaml

O arquivo `render.yaml` já está configurado corretamente:

```yaml
buildCommand: yarn install && yarn build
startCommand: node dist/server.js
```

### 3. O que foi corrigido

1. **tsconfig.json**: Adicionado `"types": ["node"]` para incluir tipos do Node.js
2. **server.ts**: Tipos explícitos adicionados para `error`, `reason` e `promise`
3. **render.yaml**: Build command agora instala devDependencies e faz build

### 4. Por que funciona agora

- `yarn install` instala **todas** as dependências, incluindo devDependencies (TypeScript e tipos)
- `yarn build` compila o TypeScript com os tipos corretos
- `node dist/server.js` inicia o servidor já compilado

### 5. Alternativa (se ainda der erro)

Se ainda houver problemas, você pode usar npm:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
node dist/server.js
```

## Verificação

Após o deploy, verifique:
1. Build completou sem erros
2. Servidor iniciou corretamente
3. Health check funciona: `GET /api/health`

## Notas

- O `yarn install` (sem flags) instala devDependencies por padrão
- O build precisa das devDependencies para compilar TypeScript
- O start command não precisa fazer build novamente (já foi feito no build command)

