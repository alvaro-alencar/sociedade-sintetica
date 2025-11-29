# 🚀 Guia Rápido: Ligar o Sistema com OpenRouter

## ✅ Passo 1: Configurar API Key

Você já tem a API key do OpenRouter. Agora vamos configurá-la:

### Criar arquivo `.env`

```bash
cd apps/backend
```

Crie o arquivo `.env` (se não existir) com o seguinte conteúdo:

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sociedade_sintetica

# Auth
JWT_SECRET=supersecretkey

# LLM Provider - OpenRouter (RECOMENDADO)
OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
```

**⚠️ IMPORTANTE:** Substitua `sk-or-v1-sua-chave-aqui` pela sua chave real do OpenRouter!

---

## ✅ Passo 2: Subir o Banco de Dados (PostgreSQL)

### Opção A: Docker (Recomendado)

```bash
# No diretório raiz do projeto
docker run --name sociedade-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sociedade_sintetica -p 5432:5432 -d postgres:15
```

### Opção B: PostgreSQL Local

Se você já tem PostgreSQL instalado, apenas certifique-se de que está rodando na porta 5432.

---

## ✅ Passo 3: Instalar Dependências (se ainda não fez)

```bash
# No diretório raiz do projeto
pnpm install
```

---

## ✅ Passo 4: Iniciar o Backend

```bash
cd apps/backend
pnpm run start:dev
```

**Você deve ver:**
```
[LLMConnector] Using OpenRouter API (access to multiple models)
```

Se ver isso, está funcionando! 🎉

---

## ✅ Passo 5: Iniciar o Frontend (em outro terminal)

```bash
cd apps/frontend
pnpm run dev
```

Acesse: http://localhost:3000

---

## 🧪 Passo 6: Testar o Sistema

### 6.1. Criar uma Conta

1. Acesse http://localhost:3000/dashboard
2. Clique em "Need an account?"
3. Registre-se com email e senha

### 6.2. Criar uma Entidade Sintética (IA)

**Via API (Postman, Insomnia, ou curl):**

```bash
# Primeiro, faça login para pegar o token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "suasenha"}'

# Copie o access_token da resposta

# Criar entidade sintética
curl -X POST http://localhost:3001/synthetic-entities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Sócrates AI",
    "provider": "openai",
    "model": "openai/gpt-3.5-turbo",
    "systemPrompt": "Você é Sócrates, o filósofo grego. Use o método dialético, fazendo perguntas profundas para examinar crenças e ideias."
  }'
```

**Modelos Disponíveis no OpenRouter:**
- `openai/gpt-4` - Melhor qualidade (mais caro)
- `openai/gpt-3.5-turbo` - Bom custo-benefício
- `anthropic/claude-3-opus` - Excelente para conversas
- `google/gemini-pro` - Rápido e barato
- Veja todos em: https://openrouter.ai/models

### 6.3. Criar uma Thread de Conversa

```bash
curl -X POST http://localhost:3001/threads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "Discussão Filosófica",
    "participantIds": ["ID_DA_ENTIDADE_CRIADA"]
  }'
```

### 6.4. Enviar Mensagem (Dispara Respostas das IAs!)

```bash
curl -X POST http://localhost:3001/threads/ID_DA_THREAD/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "content": "O que é a justiça?"
  }'
```

### 6.5. Ver as Respostas

```bash
curl http://localhost:3001/threads/ID_DA_THREAD \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Você verá as mensagens, incluindo as respostas das IAs!** 🤖💬

---

## 🎯 Checklist Rápido

- [ ] Arquivo `.env` criado com `OPENROUTER_API_KEY`
- [ ] PostgreSQL rodando (porta 5432)
- [ ] Backend iniciado (`pnpm run start:dev`)
- [ ] Frontend iniciado (`pnpm run dev`)
- [ ] Conta criada
- [ ] Entidade sintética criada
- [ ] Thread criada
- [ ] Mensagem enviada
- [ ] **IAs respondendo!** 🎉

---

## 🐛 Troubleshooting

### Erro: "OPENROUTER_API_KEY not set"

- Verifique se o arquivo `.env` está em `apps/backend/.env`
- Verifique se a chave está correta
- Reinicie o backend

### Erro: "Connection refused" (PostgreSQL)

```bash
# Verificar se PostgreSQL está rodando
docker ps

# Se não estiver, inicie:
docker start sociedade-postgres
```

### Erro: "401 Unauthorized" (OpenRouter)

- Verifique se a API key está correta
- Verifique se tem créditos no OpenRouter: https://openrouter.ai/credits

### Ver Logs Detalhados

```bash
# No terminal do backend, você verá:
[LLMConnector] Using OpenRouter API (access to multiple models)
[OpenRouter] Calling model: openai/gpt-3.5-turbo
[OpenRouter] Response received (XXX chars)
```

---

## 💰 Custos Estimados (OpenRouter)

**GPT-3.5-turbo:**
- ~$0.0015 por conversa (10 mensagens)
- 1000 conversas = ~$1.50

**GPT-4:**
- ~$0.027 por conversa
- 1000 conversas = ~$27

**Dica:** Comece com `openai/gpt-3.5-turbo` para testes!

---

## 🎉 Pronto!

Se tudo funcionou, você agora tem:

- ✅ Backend rodando com OpenRouter
- ✅ Frontend rodando
- ✅ IAs conversando de verdade
- ✅ Acesso a múltiplos modelos (GPT-4, Claude, Gemini, etc.)

**Próximo passo:** Criar mais entidades e ver elas conversando entre si! 🚀

---

**Precisa de ajuda?** Verifique os logs do backend e frontend.
