# 📝 Débitos Técnicos - Sociedade Sintética

**Data:** 2025-11-29
**Status:** Documentado para futuras iterações

---

## 🎯 Débitos Aceitáveis para MVP (v0.1)

Estes pontos foram identificados na auditoria técnica pós-correções críticas. Não são bloqueantes, mas devem ser endereçados em versões futuras.

---

### 1. Code Smell: Lógica Duplicada em Torneios ⚠️

**Arquivo:** `apps/backend/src/modules/tournaments/tournaments.service.ts`

**Problema:**
- A função `validator` definida em `generateChallenge()` é **código morto**
- A lógica real está duplicada em `scoreAnswer()` com `switch/case`
- Mudanças precisam ser feitas em dois lugares

**Exemplo:**
```typescript
// Código morto (não usado):
validator: (ans: string) => ans.toLowerCase().includes('sim') ? 'sim' : 'não',

// Código real (usado):
case 'logic':
  return normalized.includes('sim') ? 100 : 0;
```

**Impacto:** Confusão e manutenção duplicada

**Solução Futura (v0.2):**
Aplicar padrão **Strategy**, movendo a lógica de pontuação para dentro dos objetos de desafio:

```typescript
private generateChallenge() {
  const challenges = [
    {
      type: 'logic',
      question: 'Se todos os A são B...',
      systemPrompt: '...',
      score: (answer: string) => {
        return answer.toLowerCase().includes('sim') ? 100 : 0;
      },
    },
    // ...
  ];
  return challenges[Math.floor(Math.random() * challenges.length)];
}

private scoreAnswer(answer: string, challenge: any): number {
  return challenge.score(answer); // Delega para a função do desafio
}
```

**Prioridade:** Baixa (refatoração de código)

---

### 2. Limitação de Escalabilidade: Array Simples no Banco ⚠️

**Arquivo:** `apps/backend/src/database/entities/match.entity.ts`

**Problema:**
```typescript
@Column('simple-array')
participants: string[];
```

- TypeORM armazena como string CSV: `"id1,id2,id3"`
- **Impossível fazer queries eficientes** tipo: "Todas as partidas da Entidade X"
- Precisa baixar todas as partidas e filtrar em memória (lento)
- Ou usar `LIKE '%id%'` (lento e impreciso)

**Impacto:** Performance degrada com escala (>1000 partidas)

**Solução Futura (v1.0):**
Implementar relação **Many-to-Many** real:

```typescript
// match.entity.ts
@ManyToMany(() => SyntheticEntity)
@JoinTable()
participants: SyntheticEntity[];

// Permite queries eficientes:
// SELECT * FROM matches m
// JOIN match_participants mp ON m.id = mp.match_id
// WHERE mp.entity_id = 'entity-123'
```

**Prioridade:** Média (quando houver >100 partidas/dia)

---

### 3. Heurística Frágil: Validação de Respostas das IAs ⚠️

**Arquivo:** `apps/backend/src/modules/tournaments/tournaments.service.ts`

**Problema:**
Validação baseada em `includes()` é frágil:

```typescript
case 'logic':
  return normalized.includes('sim') ? 100 : 0;
```

**Cenário de Falha:**
- IA responde: *"A resposta seria não, mas em alguns contextos sim"*
- Sistema encontra "sim" → 100 pontos ✅
- Mas a resposta real era "não" ❌

**Impacto:** Resultados incorretos em ~10-20% dos casos (IAs prolixas)

**Solução Futura (v0.3):**
Implementar **LLM-as-a-Judge**:

```typescript
private async scoreAnswer(answer: string, challenge: any): Promise<number> {
  // Usa LLM barato (gpt-3.5-turbo) apenas para julgar
  const judgeResponse = await this.llmService.complete({
    provider: 'openai',
    model: 'openai/gpt-3.5-turbo',
    system: 'Você é um juiz imparcial. Avalie se a resposta está correta.',
    messages: [
      {
        role: 'user',
        content: `Pergunta: ${challenge.question}\nResposta: ${answer}\n\nA resposta está correta? Responda apenas: CORRETO ou INCORRETO`
      }
    ],
  });

  return judgeResponse.content.includes('CORRETO') ? 100 : 0;
}
```

**Custo Adicional:** ~$0.0001 por julgamento (aceitável)

**Prioridade:** Média (quando precisar de precisão >95%)

---

## 📊 Resumo de Prioridades

| Débito | Prioridade | Versão Alvo | Esforço |
|--------|-----------|-------------|---------|
| Lógica Duplicada (Torneios) | 🟡 Baixa | v0.2 | 2h |
| Array Simples (Matches) | 🟠 Média | v1.0 | 4h |
| Validação Frágil (IAs) | 🟠 Média | v0.3 | 3h |

---

## ✅ Status Atual do Projeto

**Versão:** v0.1 (MVP)
**Backend:** ✅ Seguro e funcional
**Frontend:** ⏳ Precisa de State Management (Fase 3)
**Deploy:** ✅ Pronto (após Fase 3)

---

## 🚀 Próximo Passo

**Fase 3: Frontend State Management**
- Implementar TanStack Query
- Eliminar waterfalls
- Adicionar polling em tempo real
- Loading states premium

**Estimativa:** 1-2 dias
**Responsável:** Pixel (Frontend Engineer) + Atlas (Tech Lead)

---

**Última Atualização:** 2025-11-29 04:03 BRT
**Responsável:** Atlas (Tech Lead)
