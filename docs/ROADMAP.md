# 🗺️ Sociedade Sintética - Master Roadmap

Este documento serve como o "Quadro Branco" da nossa War Room. Aqui, Atlas centraliza as tarefas de todos os agentes.

## 🎯 Objetivo Atual: MVP da Sociedade Sintética
Estabelecer a fundação sólida do monorepo, garantir que o frontend e backend se comuniquem, e aplicar a identidade visual "Glassmorphism".

---

## ✅ Fases Concluídas (2025-11-29)

### Fase 1: Limpeza Arquitetural ✅
- [x] Auditoria técnica profunda do projeto
- [x] Decisão oficial: TypeORM como ORM padrão
- [x] Remoção do pacote Prisma não utilizado
- [x] Documentação arquitetural (ARCHITECTURE.md)
- [x] Plano de ação estratégico (ACTION_PLAN.md)

### Fase 2: Integração LLM Real ✅
- [x] Instalação do OpenAI SDK
- [x] Implementação do OpenAIProvider
- [x] Atualização do LLMConnectorService com fallback inteligente
- [x] Configuração de variáveis de ambiente (.env.example)
- [x] Documentação completa de integração (LLM_INTEGRATION.md)
- [x] Build do backend validado

---

## 🚀 Próximas Fases

### Fase 3: Frontend State Management (Em Planejamento)
- [ ] Instalar TanStack Query (React Query)
- [ ] Configurar QueryClient no layout.tsx
- [ ] Criar hooks customizados:
  - [ ] useAuth() - Autenticação e perfil
  - [ ] useEntities() - Lista de entidades
  - [ ] useThreads() - Lista de threads
  - [ ] useThreadMessages(threadId) - Mensagens com polling
- [ ] Refatorar páginas para usar hooks
- [ ] Adicionar loading states e skeletons

### Fase 4: Seletor de Relevância com Embeddings (Roadmap)
- [ ] Pesquisar serviços de embeddings (OpenAI, Cohere)
- [ ] Escolher Vector Database (Pinecone, Weaviate, Qdrant)
- [ ] Implementar Embedding Service
- [ ] Criar seletor baseado em similaridade semântica
- [ ] A/B testing: random vs relevance-based

---

## 🧠 Atlas (Tech Lead)
- [x] Validar estrutura do Monorepo (TurboRepo)
- [x] Definir contratos de API em `packages/shared-types`
- [x] Enforce shared types implementation in Backend Entities
- [x] Auditoria técnica profunda (TECHNICAL_AUDIT.md)
- [x] Documentar arquitetura (ARCHITECTURE.md)
- [x] Resolver conflito TypeORM vs Prisma
- [ ] Revisar arquitetura de autenticação (NextAuth vs NestJS JWT)
- [ ] Coordenar implementação da Fase 3 (Frontend State Management)

## ✨ Lumina (UI/UX)
- [ ] Criar tokens de design no `globals.css` (Cores Neon, Blurs)
- [ ] Definir componentes base: `GlassCard`, `NeonButton`, `HolographicInput`
- [ ] Revisar UX da Home (`page.tsx`) para impacto imediato
- [ ] Design de loading states e skeletons para React Query

## 🎨 Pixel (Frontend)
- [ ] Implementar componentes visuais definidos pela Lumina
- [ ] Conectar Home Page com dados reais (ou mockados inicialmente)
- [ ] Resolver testes quebrados em `page.test.tsx`
- [ ] Implementar TanStack Query (Fase 3)
- [ ] Criar hooks customizados para gerenciamento de estado
- [ ] Adicionar polling para mensagens em tempo real

## 🔒 Cipher (Backend)
- [x] Verificar conexão com Banco de Dados (PostgreSQL/TypeORM)
- [x] Implementar integração real com OpenAI
- [x] Criar OpenAIProvider com error handling
- [x] Documentar integração LLM (LLM_INTEGRATION.md)
- [ ] Criar endpoints iniciais para `dashboard` e `tournaments`
- [ ] Garantir que o CORS e Auth Guards estejam configurados
- [ ] Implementar providers adicionais (Google, DeepSeek, Grok)
- [ ] Adicionar cost tracking para LLM usage

## 🛡️ Sentinel (DevOps/QA)
- [ ] Corrigir configuração do Vitest (Erro de módulo relatado anteriormente)
- [ ] Garantir que `pnpm build` rode sem erros em todo o monorepo
- [ ] Configurar script de "Health Check" para os serviços
- [ ] Criar testes E2E para fluxo de conversação
- [ ] Configurar CI/CD pipeline (GitHub Actions)

---

## 📊 Progresso Geral

**Foundation Phase:** 🟢 70% Completo

- ✅ Arquitetura definida e documentada
- ✅ ORM padronizado (TypeORM)
- ✅ LLM integration implementada
- 🔄 Frontend state management (próximo)
- ⏳ UI/UX polish (pendente)
- ⏳ Testes automatizados (pendente)

---

**Status:** 🚀 Em Desenvolvimento Ativo (Foundation Phase)
**Última Atualização:** 2025-11-29 03:18 BRT
**Responsável:** Atlas (Tech Lead)

