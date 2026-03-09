# 679 DataConsult - TODO

## Banco de Dados
- [x] Schema Drizzle com tabelas: users, queries, sessions, logs, access_time
- [x] Migrations e tipos TypeScript gerados

## Backend (tRPC)
- [x] Autenticação: login com email/senha, logout, sessões com UUID
- [x] Procedures protegidas e públicas
- [ ] Rate limiting para consultas
- [ ] Integração com API iseek.pro (CPF, CNPJ, RG, placa, telefone, fotos)
- [x] Rotas administrativas: usuários, tempo de acesso, logs, sessões
- [x] Validação com Zod
- [ ] Testes com Vitest

## Frontend (React)
- [x] Página de login
- [x] Dashboard com estatísticas
- [x] Consultar Dados (CPF, CNPJ, RG, placa, telefone)
- [x] Consultar Fotos (CNH, CRLV, registros estaduais)
- [x] Histórico de consultas com filtros e paginação
- [x] Perfil do usuário
- [x] Painel administrativo:
  - [x] Gestão de usuários
  - [x] Controle de tempo de acesso
  - [x] Visualização de logs
  - [ ] Gerenciamento de sessões
- [x] Sistema de controle de tempo (verde/amarelo/vermelho)
- [x] Layout responsivo e moderno

## Segurança
- [x] Proteção de rotas com autenticação
- [x] Validação de entrada com Zod
- [ ] Rate limiting
- [ ] CORS configurado
- [x] Senhas criptografadas (bcrypt)
- [x] Tokens de sessão seguros

## Produção
- [x] Variáveis de ambiente configuradas
- [x] Dockerfile e docker-compose
- [x] Guias de deploy (VPS, PaaS)
- [ ] Testes de segurança
- [x] Documentação completa
- [x] Integração com API iseek.pro (chave de API)
- [x] Testes de fluxo completo

## Integração API iseek.pro
- [x] Validação de formatos (CPF, CNPJ, RG, placa, telefone, CNH, CRLV)
- [x] Formatação de valores
- [x] Chamadas à API com endpoint dinâmico
- [x] Tratamento de erros
- [x] Registro de consultas no histórico
- [x] 40+ módulos de dados implementados
- [x] 16+ módulos de fotos implementados
- [x] Módulo CPF Completo (todos os dados de uma vez)
- [x] Módulo Fotos Completo (todos os estados de uma vez)
- [x] Interface React com seleção de módulos por categoria


## Autenticação Google OAuth
- [ ] Configurar Google OAuth credentials
- [ ] Implementar login com Google
- [ ] Remover autenticação Manus OAuth
- [ ] Criar painel de admin
- [ ] Gestão de usuários no painel (criar, editar, bloquear, excluir)
- [ ] Controle de acesso (apenas usuários criados podem logar)
- [ ] Testar fluxo completo
