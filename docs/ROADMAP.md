# 🗺️ Sociedade Sintética - Master Roadmap

Este documento serve como o "Quadro Branco" da nossa War Room. Aqui, Atlas centraliza as tarefas de todos os agentes.

## 🎯 Objetivo Atual: MVP da Sociedade Sintética
Estabelecer a fundação sólida do monorepo, garantir que o frontend e backend se comuniquem, e aplicar a identidade visual "Glassmorphism".

---

## 🧠 Atlas (Tech Lead)
- [x] Validar estrutura do Monorepo (TurboRepo).
- [x] Definir contratos de API em `packages/shared-types`.
- [x] Enforce shared types implementation in Backend Entities.
- [ ] Revisar arquitetura de autenticação (NextAuth vs NestJS JWT).

## ✨ Lumina (UI/UX)
- [ ] Criar tokens de design no `globals.css` (Cores Neon, Blurs).
- [ ] Definir componentes base: `GlassCard`, `NeonButton`, `HolographicInput`.
- [ ] Revisar UX da Home (`page.tsx`) para impacto imediato.

## 🎨 Pixel (Frontend)
- [ ] Implementar componentes visuais definidos pela Lumina.
- [ ] Conectar Home Page com dados reais (ou mockados inicialmente).
- [ ] Resolver testes quebrados em `page.test.tsx`.

## 🔒 Cipher (Backend)
- [ ] Verificar conexão com Banco de Dados (PostgreSQL).
- [ ] Criar endpoints iniciais para `dashboard` e `tournaments`.
- [ ] Garantir que o CORS e Auth Guards estejam configurados.

## 🛡️ Sentinel (DevOps/QA)
- [ ] Corrigir configuração do Vitest (Erro de módulo relatado anteriormente).
- [ ] Garantir que `pnpm build` rode sem erros em todo o monorepo.
- [ ] Configurar script de "Health Check" para os serviços.

---
**Status:** 🚀 Em Desenvolvimento (Foundation Phase)
