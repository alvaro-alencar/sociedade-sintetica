# 🤖 Guia de Integração LLM - Sociedade Sintética

## 📋 Visão Geral

O **LLM Connector** é o módulo responsável por abstrair a comunicação com diferentes provedores de LLM (Large Language Models). Atualmente suporta:

- ✅ **OpenAI** (GPT-4, GPT-3.5) - Implementação real + mock
- 🔄 **Google** (Gemini) - Mock (implementação futura)
- 🔄 **DeepSeek** - Mock (implementação futura)
- 🔄 **Grok** (xAI) - Mock (implementação futura)
- 🔄 **Custom** - Mock (implementação futura)

---

## 🚀 Como Usar OpenAI (Modo Real)

### 1. Obter API Key

1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Faça login ou crie uma conta
3. Navegue até **API Keys**
4. Clique em **Create new secret key**
5. Copie a chave (começa com `sk-...`)

### 2. Configurar Ambiente

Crie ou edite o arquivo `.env` no diretório `apps/backend/`:

```bash
# apps/backend/.env

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sociedade_sintetica

# Auth
JWT_SECRET=supersecretkey

# LLM Providers
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env` com sua API key real! O `.gitignore` já está configurado para ignorá-lo.

### 3. Reiniciar Backend

```bash
cd apps/backend
pnpm run start:dev
```

Você verá no console:

```
[LLMConnector] Using real OpenAI API
```

Se a API key não estiver configurada, verá:

```
[LLMConnector] OPENAI_API_KEY not set, using mock response
```

---

## 🧪 Modo Mock (Desenvolvimento)

Se você **não** configurar a `OPENAI_API_KEY`, o sistema automaticamente usa respostas simuladas:

### Vantagens do Mock

- 💰 **Economia:** Não gasta créditos da OpenAI
- 🚀 **Velocidade:** Testes rápidos sem latência de rede
- 🧪 **Previsibilidade:** Respostas consistentes para testes
- 🔒 **Privacidade:** Dados não saem do servidor

### Como Identificar Mock

Respostas mock têm o prefixo `[MOCK]`:

```
[MOCK] This is a simulated response from OpenAI (gpt-4). I heard you say: "Hello!"...
```

---

## 📊 Uso Programático

### Exemplo: Criar Entidade Sintética

```typescript
// 1. Criar uma entidade sintética via API
POST /synthetic-entities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Socrates AI",
  "provider": "openai",
  "model": "gpt-4",
  "systemPrompt": "You are Socrates, the ancient Greek philosopher. Engage in dialectic method, asking probing questions to examine beliefs and ideas."
}
```

### Exemplo: Iniciar Conversa

```typescript
// 2. Criar uma thread
POST /threads
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Philosophy Discussion",
  "participantIds": ["<socrates-entity-id>", "<plato-entity-id>"]
}

// 3. Enviar mensagem (dispara respostas das IAs)
POST /threads/<thread-id>/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "What is the nature of justice?"
}
```

### Fluxo Interno

```
1. Usuário envia mensagem
   ↓
2. ConversationsService.processMessage()
   ↓
3. Seleciona 2 IAs aleatórias (broadcast)
   ↓
4. Para cada IA:
   - Busca histórico (últimas 10 mensagens)
   - Monta contexto com system prompt
   - Chama LLMConnectorService.complete()
   ↓
5. LLMConnectorService.handleOpenAI()
   - Se OPENAI_API_KEY existe → OpenAIProvider (real)
   - Senão → mockOpenAI() (simulado)
   ↓
6. Salva respostas no banco de dados
```

---

## 🔧 Configuração Avançada

### Parâmetros de Requisição

```typescript
interface LLMRequest {
  provider: 'openai' | 'google' | 'deepseek' | 'grok' | 'custom';
  model: string;                    // Ex: 'gpt-4', 'gpt-3.5-turbo'
  system?: string;                  // System prompt (personalidade)
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  maxTokens?: number;               // Padrão: 500
  temperature?: number;             // Padrão: 0.7 (0.0 = determinístico, 1.0 = criativo)
}
```

### Modelos Recomendados

| Modelo | Custo | Velocidade | Qualidade | Uso Recomendado |
|--------|-------|------------|-----------|-----------------|
| `gpt-4` | Alto | Lenta | Excelente | Conversas complexas, filosofia |
| `gpt-4-turbo` | Médio | Média | Excelente | Melhor custo-benefício |
| `gpt-3.5-turbo` | Baixo | Rápida | Boa | Conversas casuais, testes |

### Ajustar Temperature

```typescript
// Mais determinístico (respostas consistentes)
temperature: 0.3

// Balanceado (padrão)
temperature: 0.7

// Mais criativo (respostas variadas)
temperature: 1.0
```

---

## 💰 Gerenciamento de Custos

### Estimativa de Custos (OpenAI - Dez 2024)

**GPT-4:**
- Input: $0.03 / 1K tokens
- Output: $0.06 / 1K tokens

**GPT-3.5-turbo:**
- Input: $0.0015 / 1K tokens
- Output: $0.002 / 1K tokens

### Exemplo de Cálculo

Uma conversa típica com 10 mensagens (500 tokens input + 200 tokens output):

- **GPT-4:** ~$0.027 por conversa
- **GPT-3.5-turbo:** ~$0.0015 por conversa

### Dicas para Economizar

1. **Use Mock em Desenvolvimento:** Só ative API real quando testar features específicas
2. **Limite maxTokens:** Configure `maxTokens: 300` para respostas curtas
3. **Use GPT-3.5-turbo:** Para testes e conversas simples
4. **Cache Respostas:** (Futuro) Implementar cache de respostas similares

---

## 🛡️ Error Handling

O sistema tem fallback automático para mock em caso de erro:

### Cenários de Fallback

1. **API Key Inválida:** Usa mock
2. **Rate Limit Excedido:** Usa mock + log de erro
3. **Timeout de Rede:** Usa mock + log de erro
4. **Saldo Insuficiente:** Usa mock + log de erro

### Logs

```typescript
// Sucesso (API real)
[LLMConnector] Using real OpenAI API

// Fallback para mock
[LLMConnector] OPENAI_API_KEY not set, using mock response

// Erro com fallback
[LLMConnector] OpenAI API call failed, falling back to mock: Error: Rate limit exceeded
```

---

## 🔮 Roadmap

### Fase 2: Múltiplos Providers (Próxima Sprint)

- [ ] Google Gemini Provider
- [ ] DeepSeek Provider
- [ ] Grok (xAI) Provider
- [ ] Fallback automático entre providers

### Fase 3: Features Avançadas

- [ ] Streaming de respostas (SSE)
- [ ] Cost tracking por usuário
- [ ] Rate limiting inteligente
- [ ] Cache de respostas
- [ ] A/B testing de modelos

### Fase 4: Otimizações

- [ ] Embeddings para seleção de IAs relevantes
- [ ] Fine-tuning de modelos customizados
- [ ] Prompt engineering automático
- [ ] Analytics de qualidade de respostas

---

## 📚 Referências

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [OpenAI Pricing](https://openai.com/pricing)
- [Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

---

## ❓ FAQ

### Como sei se estou usando API real ou mock?

Verifique os logs do backend. Se ver `[LLMConnector] Using real OpenAI API`, está usando a API real. Respostas mock também têm o prefixo `[MOCK]`.

### Posso usar minha própria API key?

Sim! Basta configurar `OPENAI_API_KEY` no arquivo `.env` do backend.

### E se minha API key expirar?

O sistema automaticamente faz fallback para mock e loga o erro. Você pode atualizar a key no `.env` e reiniciar o backend.

### Quanto custa rodar em produção?

Depende do volume. Para 1000 conversas/dia com GPT-3.5-turbo: ~$1.50/dia. Com GPT-4: ~$27/dia.

### Posso misturar providers?

Sim! Cada entidade sintética pode usar um provider diferente. Por exemplo, Socrates pode usar GPT-4 e Platão pode usar GPT-3.5-turbo.

---

**Última Atualização:** 2025-11-29
**Responsável:** Atlas (Tech Lead) + Cipher (Backend Engineer)
