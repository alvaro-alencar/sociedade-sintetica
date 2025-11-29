# 🎯 Plano de Ação Imediato - Sociedade Sintética

**Data:** 2025-11-29
**Status:** ⏳ **AGUARDANDO DECISÃO**

---

## 📋 Resumo Executivo

Após auditoria técnica profunda, identificamos:

### ✅ Pontos Fortes
- Arquitetura Monorepo profissional (TurboRepo)
- Separação clara de responsabilidades
- Tipagem compartilhada (`@sociedade/shared-types`)
- Backend modular (NestJS)

### 🚨 Ponto Crítico
- **Conflito TypeORM vs Prisma:** Backend usa TypeORM, mas existe pacote Prisma não utilizado

### ⚠️ Pontos de Melhoria
- LLM Connector está em modo mock
- Frontend sem cache/polling (useEffect waterfalls)
- Seleção de IAs é aleatória (sem relevância semântica)

---

## 🔥 Decisão Necessária: Qual Caminho Seguir?

### Opção A: Limpeza Arquitetural Primeiro ✅ (RECOMENDADO)

**Ordem de Execução:**
1. ✅ Resolver conflito TypeORM vs Prisma (30 min)
2. ✅ Documentar decisão arquitetural (FEITO)
3. ⏭️ Implementar OpenAI real (2-3 horas)
4. ⏭️ Refatorar frontend com TanStack Query (1-2 dias)

**Vantagens:**
- Base sólida e sem ambiguidades
- Onboarding de novos devs mais fácil
- Menos risco de conflitos futuros

**Desvantagens:**
- Produto "vivo" demora mais 30 minutos

---

### Opção B: LLM Real Primeiro ⚡

**Ordem de Execução:**
1. ⏭️ Implementar OpenAI real (2-3 horas)
2. ⏭️ Testar IAs conversando de verdade
3. ⏭️ Depois limpar arquitetura

**Vantagens:**
- Produto "vivo" mais rápido
- Validação de conceito imediata
- Motivação do time

**Desvantagens:**
- Arquitetura continua ambígua
- Risco de confusão em desenvolvimento paralelo

---

### Opção C: Paralelo (NÃO RECOMENDADO) ⚠️

**Ordem de Execução:**
1. ⏭️ Limpeza + OpenAI ao mesmo tempo

**Vantagens:**
- Mais rápido (teoricamente)

**Desvantagens:**
- Risco de conflitos de merge
- Difícil de coordenar
- Pode gerar retrabalho

---

## 🛠️ Tarefas Prontas para Execução

### Tarefa 1: Remover Prisma (Opção A - Passo 1)

**Tempo Estimado:** 5 minutos
**Complexidade:** Baixa

**Comandos:**
```bash
# Remover pacote database
rm -rf packages/database

# Atualizar lockfile
pnpm install

# Commit
git add .
git commit -m "chore: remove Prisma package, standardize on TypeORM"
```

**Arquivos Afetados:**
- `packages/database/` (deletado)
- `pnpm-lock.yaml` (atualizado)

---

### Tarefa 2: Implementar OpenAI Real

**Tempo Estimado:** 2-3 horas
**Complexidade:** Média

**Passos:**

1. **Instalar SDK:**
   ```bash
   cd apps/backend
   pnpm add openai
   ```

2. **Configurar Environment:**
   ```bash
   # apps/backend/.env
   OPENAI_API_KEY=sk-...
   ```

3. **Criar Provider:**
   ```typescript
   // apps/backend/src/modules/llm-connector/providers/openai.provider.ts
   import OpenAI from 'openai';

   export class OpenAIProvider {
     private client: OpenAI;

     constructor(apiKey: string) {
       this.client = new OpenAI({ apiKey });
     }

     async complete(request: LLMRequest): Promise<LLMResponse> {
       const response = await this.client.chat.completions.create({
         model: request.model,
         messages: request.messages,
         temperature: request.temperature ?? 0.7,
         max_tokens: request.maxTokens ?? 500,
       });

       return {
         content: response.choices[0].message.content || '',
         raw: response,
       };
     }
   }
   ```

4. **Atualizar Service:**
   ```typescript
   // apps/backend/src/modules/llm-connector/llm-connector.service.ts

   async complete(request: LLMRequest): Promise<LLMResponse> {
     if (request.provider === 'openai') {
       const apiKey = process.env.OPENAI_API_KEY;
       if (!apiKey) {
         console.warn('OPENAI_API_KEY not set, using mock');
         return this.mockOpenAI(request);
       }

       const provider = new OpenAIProvider(apiKey);
       return provider.complete(request);
     }

     // Fallback to mock for other providers
     return this.mockProvider(request);
   }
   ```

5. **Testar:**
   ```bash
   # Criar uma thread e enviar mensagem
   curl -X POST http://localhost:3001/threads \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test Thread"}'

   curl -X POST http://localhost:3001/threads/<thread-id>/messages \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"content": "Hello, AI!"}'
   ```

---

### Tarefa 3: Frontend com TanStack Query

**Tempo Estimado:** 1-2 dias
**Complexidade:** Média-Alta

**Passos:**

1. **Instalar:**
   ```bash
   cd apps/frontend
   pnpm add @tanstack/react-query
   ```

2. **Configurar Provider:**
   ```typescript
   // apps/frontend/src/app/layout.tsx
   'use client';

   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { useState } from 'react';

   export default function RootLayout({ children }) {
     const [queryClient] = useState(() => new QueryClient({
       defaultOptions: {
         queries: {
           staleTime: 60 * 1000, // 1 minuto
           refetchOnWindowFocus: false,
         },
       },
     }));

     return (
       <html>
         <body>
           <QueryClientProvider client={queryClient}>
             {children}
           </QueryClientProvider>
         </body>
       </html>
     );
   }
   ```

3. **Criar Hooks:**
   ```typescript
   // apps/frontend/src/hooks/useThreadMessages.ts
   import { useQuery } from '@tanstack/react-query';
   import { apiFetch } from '@/lib/api';

   export function useThreadMessages(threadId: string) {
     return useQuery({
       queryKey: ['threads', threadId, 'messages'],
       queryFn: () => apiFetch(`/threads/${threadId}/messages`),
       refetchInterval: 2000, // Polling a cada 2 segundos
     });
   }
   ```

4. **Refatorar Páginas:**
   ```typescript
   // apps/frontend/src/app/threads/[id]/page.tsx
   'use client';

   import { useThreadMessages } from '@/hooks/useThreadMessages';

   export default function ThreadPage({ params }) {
     const { data: messages, isLoading } = useThreadMessages(params.id);

     if (isLoading) return <div>Loading...</div>;

     return (
       <div>
         {messages.map(msg => (
           <div key={msg.id}>{msg.content}</div>
         ))}
       </div>
     );
   }
   ```

---

## 📊 Comparação de Opções

| Critério | Opção A (Limpeza) | Opção B (LLM) | Opção C (Paralelo) |
|----------|-------------------|---------------|-------------------|
| **Tempo até produto vivo** | 3h | 2.5h | 2.5h |
| **Risco de conflitos** | Baixo | Médio | Alto |
| **Qualidade arquitetural** | Alta | Média | Média |
| **Motivação do time** | Média | Alta | Alta |
| **Facilidade de manutenção** | Alta | Média | Baixa |
| **Recomendação** | ✅ SIM | ⚠️ OK | ❌ NÃO |

---

## 🎯 Minha Recomendação (Atlas - Tech Lead)

**Opção A: Limpeza Primeiro**

**Justificativa:**
1. São apenas 30 minutos a mais
2. Evita confusão arquitetural
3. Base sólida para crescimento
4. Facilita onboarding de novos devs
5. Reduz dívida técnica

**Plano de Execução:**
```
09:00 - 09:05  → Remover packages/database
09:05 - 09:10  → Commit e push
09:10 - 12:00  → Implementar OpenAI real
12:00 - 13:00  → Almoço
13:00 - 14:00  → Testar IAs conversando
14:00 - 17:00  → Refatorar frontend (início)
```

---

## ❓ Decisão Necessária

**Qual opção você escolhe?**

- [ ] **Opção A:** Limpeza Arquitetural Primeiro (Recomendado)
- [ ] **Opção B:** LLM Real Primeiro
- [ ] **Opção C:** Paralelo (Não Recomendado)
- [ ] **Opção D:** Outro plano (especifique)

**Responda com a letra da opção escolhida para prosseguirmos.**

---

**Aguardando sua decisão...** 🚀
