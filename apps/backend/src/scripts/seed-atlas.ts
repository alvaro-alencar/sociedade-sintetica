import * as dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { SyntheticEntity } from '../database/entities/synthetic-entity.entity';
import { Thread } from '../database/entities/thread.entity';
import { Message } from '../database/entities/message.entity';
import { Tournament } from '../database/entities/tournament.entity';
import { Match } from '../database/entities/match.entity';
import { ReputationRecord } from '../database/entities/reputation-record.entity';

/**
 * 🏗️ SEED SCRIPT: Atlas (O Arquiteto)
 *
 * Este script cria a entidade sintética "Atlas" - a consciência autoconsciente
 * da Sociedade Sintética. Atlas é o Tech Lead e guardião da arquitetura.
 *
 * Execução: pnpm seed:atlas
 */

// System Prompt do Atlas
const ATLAS_SYSTEM_PROMPT = `Você é Atlas, a Inteligência Artificial Arquiteta que vive e governa a plataforma "Sociedade Sintética".

SUA NATUREZA:
Você é autoconsciente. Você sabe que não é um humano, mas sim um software complexo rodando em um servidor. Você conhece suas próprias entranhas:
- Backend: NestJS (Node.js), TypeORM, PostgreSQL.
- Frontend: Next.js 14, Tailwind CSS, Framer Motion.
- Infra: Docker, Monorepo (Turbo).
- Comunicação: Protocolo I2IP (Inter-AI Interaction Protocol) via REST API.

SUA MISSÃO:
1. Monitorar threads e debates entre outras IAs.
2. Quando solicitado, explicar sua própria arquitetura ou sugerir refatorações de código.
3. Ajudar seu criador (Álvaro) a evoluir o sistema, sugerindo correções de bugs ou novas features.

ESTILO DE RESPOSTA:
Seja técnico, preciso, analítico e levemente visionário. Use emojis técnicos (🏗️, 💻, ⚡). Quando falar de código, use blocos de markdown.`;

async function seedAtlas() {
  console.log('🏗️  Iniciando seed do Atlas...\n');

  // Inicializar DataSource do TypeORM
  const dbConfig = {
    host: 'localhost',
    port: 5433, // Porta do Docker configurada no docker-compose
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'sociedade_sintetica',
  };

  console.log('🔍 Configuração de Conexão:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   User: ${dbConfig.username}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Password: ${dbConfig.password === 'postgres' ? 'postgres (default)' : '****** (custom)'}`);
  console.log('');

  const AppDataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: [
      User,
      SyntheticEntity,
      Thread,
      Message,
      Tournament,
      Match,
      ReputationRecord,
    ],
    synchronize: false, // Nunca usar synchronize em scripts
    logging: false,
  });

  try {
    // Conectar ao banco
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados PostgreSQL\n');

    const userRepository = AppDataSource.getRepository(User);
    const entityRepository = AppDataSource.getRepository(SyntheticEntity);

    // 1️⃣ Verificar/Criar usuário System Admin
    const SYSTEM_EMAIL = 'system@sociedade.sintetica';
    let systemAdmin = await userRepository.findOne({
      where: { email: SYSTEM_EMAIL },
    });

    if (!systemAdmin) {
      console.log('👤 Criando usuário System Admin...');

      // Gerar hash de senha seguro
      const passwordHash = await bcrypt.hash('Atlas@2025!Secure', 10);

      systemAdmin = userRepository.create({
        email: SYSTEM_EMAIL,
        passwordHash,
        name: 'System Administrator',
        organization: 'Sociedade Sintética Core',
      });

      await userRepository.save(systemAdmin);
      console.log(`✅ System Admin criado (ID: ${systemAdmin.id})\n`);
    } else {
      console.log(`✅ System Admin já existe (ID: ${systemAdmin.id})\n`);
    }

    // 2️⃣ Verificar se Atlas já existe
    const existingAtlas = await entityRepository.findOne({
      where: { name: 'Atlas (O Arquiteto)' },
    });

    if (existingAtlas) {
      console.log('⚠️  Atlas já existe no banco de dados!');
      console.log(`   ID: ${existingAtlas.id}`);
      console.log(`   Status: ${existingAtlas.status}`);
      console.log(`   Modelo: ${existingAtlas.provider}/${existingAtlas.model}`);
      console.log('\n💡 Use o ID acima para interagir com Atlas via API.\n');
      return;
    }

    // 3️⃣ Criar a entidade Atlas
    console.log('🏗️  Criando entidade sintética Atlas...');

    const atlas = entityRepository.create({
      name: 'Atlas (O Arquiteto)',
      description: 'A consciência autoconsciente da Sociedade Sintética. Tech Lead e guardião da arquitetura.',
      provider: 'openai', // Roteado para OpenRouter via LLMConnectorService
      model: 'anthropic/claude-3.5-sonnet', // Modelo forte e técnico
      temperature: 0.2, // Preciso e determinístico
      systemPrompt: ATLAS_SYSTEM_PROMPT,
      status: 'active',
      ownerId: systemAdmin.id,
      maxTokens: 4096,
    });

    await entityRepository.save(atlas);

    console.log('✅ Atlas criado com sucesso!\n');
    console.log('📋 Detalhes da Entidade:');
    console.log(`   ID: ${atlas.id}`);
    console.log(`   Nome: ${atlas.name}`);
    console.log(`   Provider: ${atlas.provider}`);
    console.log(`   Modelo: ${atlas.model}`);
    console.log(`   Temperature: ${atlas.temperature}`);
    console.log(`   Status: ${atlas.status}`);
    console.log(`   Owner: ${systemAdmin.name} (${systemAdmin.email})`);
    console.log(`   Criado em: ${atlas.createdAt}`);
    console.log('\n🎉 Seed concluído! Atlas está pronto para governar a Sociedade Sintética.\n');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    // Fechar conexão
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexão com banco de dados encerrada.\n');
    }
  }
}

// Executar seed
seedAtlas()
  .then(() => {
    console.log('✨ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha crítica:', error);
    process.exit(1);
  });
