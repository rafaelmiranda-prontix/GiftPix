FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build TypeScript
RUN npm run build

# Criar diretório de logs
RUN mkdir -p logs

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/server.js"]
