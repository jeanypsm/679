# DataConsult - Plataforma de Consulta de Dados

Aplicação web profissional para consulta de dados via API iseek.pro com autenticação local, painel administrativo e controle de acesso baseado em roles.

## 🚀 Funcionalidades

- **Autenticação Local**: Login por email e senha (sem OAuth externo)
- **Sistema de Sessões**: Tokens UUID armazenados em banco de dados
- **Painel Administrativo**: Acesso via rota `/zaguinha1#`
- **Controle de Acesso**: Roles admin/user com permissões granulares
- **Integração iseek.pro**: Consultas de CPF, CNPJ, RG, veículos, fotos e mais
- **Histórico de Consultas**: Rastreamento completo de atividades
- **Controle de Tempo**: Sistema de minutos de acesso por usuário

## 📋 Requisitos

- Node.js 18+
- pnpm 10+
- MySQL 8+ ou TiDB
- Conta em iseek.pro (para API token)

## 🔧 Instalação Local

```bash
# Clonar repositório
git clone <seu-repositorio>
cd dataconsult

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar migrações do banco
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📦 Deploy em Vercel

### 1. Preparar GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/dataconsult.git
git push -u origin main
```

### 2. Conectar com Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`: String de conexão MySQL/TiDB
   - `JWT_SECRET`: Chave secreta para JWT
   - `ISEEK_API_TOKEN`: Token da API iseek.pro

### 3. Deploy Automático

Após conectar com Vercel, cada push para `main` acionará um novo deploy automaticamente.

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | String de conexão do banco | ✅ |
| `JWT_SECRET` | Chave para assinar tokens JWT | ✅ |
| `ISEEK_API_TOKEN` | Token da API iseek.pro | ❌ |
| `VITE_APP_TITLE` | Título da aplicação | ❌ |
| `VITE_APP_LOGO` | URL do logo | ❌ |

## 🗄️ Banco de Dados

A aplicação usa Drizzle ORM com suporte a MySQL/TiDB.

### Tabelas Principais

- **users**: Usuários do sistema
- **sessions**: Sessões ativas
- **queries**: Histórico de consultas
- **activity_logs**: Logs de atividade

### Criar Usuário Admin

```bash
pnpm node create-admin.mjs
```

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Executar testes com coverage
pnpm test:coverage
```

## 📱 Rotas Principais

- `/login` - Página de login
- `/dashboard` - Dashboard principal (autenticado)
- `/zaguinha1#` - Painel administrativo (admin only)
- `/perfil` - Perfil do usuário (autenticado)

## 🔐 Segurança

- Senhas armazenadas com hash PBKDF2
- Sessões com tokens UUID
- Proteção CSRF em formulários
- Validação de entrada com Zod
- Rate limiting em endpoints críticos

## 📞 Suporte

Para problemas ou dúvidas, abra uma issue no repositório.

## 📄 Licença

MIT
