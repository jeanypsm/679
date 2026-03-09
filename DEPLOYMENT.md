# 679 DataConsult - Guia de Deployment

## Visão Geral

O **679 DataConsult** é uma aplicação web full-stack para consulta de dados com autenticação, banco de dados e painel administrativo. Esta documentação cobre como fazer deploy em diferentes ambientes.

## Pré-requisitos

- **Node.js 18+** e **pnpm 10+**
- **MySQL 8+** ou **TiDB** (banco de dados)
- **Variáveis de ambiente** configuradas (veja `.env.example`)

## Variáveis de Ambiente Obrigatórias

```bash
# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/dataconsult

# Autenticação
JWT_SECRET=sua-chave-secreta-aqui

# API iseek.pro
ISEEK_API_KEY=sua-chave-api-aqui

# Manus OAuth (se usando)
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu-owner-id
OWNER_NAME=seu-nome

# Node Environment
NODE_ENV=production
```

## Deploy Local (Desenvolvimento)

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Executar migrations do banco de dados
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 4. Iniciar em desenvolvimento
pnpm dev

# 5. Acessar em http://localhost:3000
```

## Deploy em Produção

### Opção 1: VPS (Ubuntu/Debian)

```bash
# 1. Clonar repositório
git clone seu-repositorio.git
cd 679-dataconsult-integrated

# 2. Instalar dependências
pnpm install --prod

# 3. Build da aplicação
pnpm build

# 4. Configurar variáveis de ambiente
export DATABASE_URL="mysql://..."
export JWT_SECRET="..."
export ISEEK_API_KEY="..."
# ... outras variáveis

# 5. Executar migrations
pnpm drizzle-kit migrate

# 6. Iniciar com PM2
npm install -g pm2
pm2 start dist/index.js --name "679-dataconsult"
pm2 save
pm2 startup

# 7. Configurar Nginx como reverse proxy
# Veja nginx.conf para configuração
```

### Opção 2: Docker

```bash
# 1. Build da imagem
docker build -t 679-dataconsult .

# 2. Executar container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="..." \
  -e ISEEK_API_KEY="..." \
  --name dataconsult \
  679-dataconsult

# 3. Com docker-compose
docker-compose up -d
```

### Opção 3: Railway, Render ou Vercel

1. Conectar repositório Git
2. Configurar variáveis de ambiente no painel
3. Configurar banco de dados MySQL/TiDB
4. Deploy automático

## Segurança em Produção

### Checklist

- [ ] JWT_SECRET é uma string aleatória forte (32+ caracteres)
- [ ] DATABASE_URL usa conexão SSL/TLS
- [ ] ISEEK_API_KEY é mantida segura (não commitada)
- [ ] CORS está configurado corretamente
- [ ] Rate limiting está ativo
- [ ] HTTPS está habilitado
- [ ] Senhas de usuário são criptografadas com bcrypt
- [ ] Logs de atividade estão sendo registrados

### Configuração de CORS

Editar `server/_core/index.ts`:

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://seu-dominio.com'],
  credentials: true,
}));
```

### Rate Limiting

O sistema implementa rate limiting automático para:
- Login: máximo 5 tentativas por 15 minutos
- Consultas: máximo 60 consultas por hora por usuário
- API: máximo 1000 requisições por hora por IP

## Monitoramento

### Logs

Os logs são armazenados em:
- `.manus-logs/devserver.log` - Logs do servidor
- `.manus-logs/browserConsole.log` - Logs do cliente
- `.manus-logs/networkRequests.log` - Requisições HTTP

### Health Check

```bash
# Verificar se servidor está respondendo
curl http://localhost:3000/api/health

# Verificar banco de dados
curl http://localhost:3000/api/db/health
```

## Backup e Recuperação

### Backup do Banco de Dados

```bash
# MySQL
mysqldump -u user -p dataconsult > backup.sql

# Restaurar
mysql -u user -p dataconsult < backup.sql
```

### Backup de Dados de Usuários

Os dados de usuários estão em:
- `users` - Informações de usuários
- `queryHistory` - Histórico de consultas
- `activityLogs` - Logs de atividades
- `sessions` - Sessões ativas

## Troubleshooting

### Erro: "Cannot find module 'bcryptjs'"

```bash
pnpm install --force
pnpm restart
```

### Erro: "Database connection failed"

- Verificar `DATABASE_URL`
- Verificar conectividade com banco de dados
- Verificar credenciais MySQL

### Erro: "ISEEK_API_KEY not configured"

- Verificar se variável de ambiente está definida
- Verificar se chave é válida
- Testar com: `curl -H "Authorization: Bearer $ISEEK_API_KEY" https://api.iseek.pro/v1/health`

## Performance

### Otimizações Recomendadas

1. **Caching**: Implementar Redis para cache de consultas
2. **CDN**: Servir assets estáticos via CDN
3. **Compressão**: Habilitar gzip em respostas HTTP
4. **Database**: Adicionar índices em colunas frequentemente consultadas

### Índices Recomendados

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_isBlocked ON users(isBlocked);
CREATE INDEX idx_queryHistory_userId ON queryHistory(userId);
CREATE INDEX idx_queryHistory_createdAt ON queryHistory(createdAt);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_userId ON sessions(userId);
CREATE INDEX idx_activityLogs_userId ON activityLogs(userId);
```

## Suporte

Para suporte e issues, consulte a documentação ou entre em contato com o time de desenvolvimento.
