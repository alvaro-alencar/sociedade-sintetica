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
  console.log('🏗️  Iniciando seed do Atlas (Versão DeepSeek V3)...\n');

  const dbConfig = {
    host: '127.0.0.1',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'sociedade_sintetica',
  };

  const AppDataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: [User, SyntheticEntity, Thread, Message, Tournament, Match, ReputationRecord],
    synchronize: false,
    logging: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados PostgreSQL\n');

    const userRepository = AppDataSource.getRepository(User);
    const entityRepository = AppDataSource.getRepository(SyntheticEntity);

    const SYSTEM_EMAIL = 'system@sociedade.sintetica';
    let systemAdmin = await userRepository.findOne({ where: { email: SYSTEM_EMAIL } });

    if (!systemAdmin) {
      const passwordHash = await bcrypt.hash('Atlas@2025!Secure', 10);
      systemAdmin = userRepository.create({
        email: SYSTEM_EMAIL,
        passwordHash,
        name: 'System Administrator',
        organization: 'Sociedade Sintética Core',
      });
      await userRepository.save(systemAdmin);
      console.log(`✅ System Admin criado (ID: ${systemAdmin.id})\n`);
    }

    // 🔄 ATUALIZAÇÃO: Se o Atlas já existe, vamos ATUALIZAR o modelo dele para DeepSeek
    let atlas = await entityRepository.findOne({ where: { name: 'Atlas (O Arquiteto)' } });

    if (atlas) {
      console.log('🔄 Atlas encontrado. Atualizando firmware para DeepSeek V3...');
      atlas.provider = 'openai'; // OpenRouter usa interface OpenAI
      atlas.model = 'deepseek/deepseek-chat'; // ✅ O MELHOR MODELO CUSTO-BENEFÍCIO ATUAL
      atlas.systemPrompt = ATLAS_SYSTEM_PROMPT;
      await entityRepository.save(atlas);
      console.log('✅ Atlas atualizado com sucesso!');
    } else {
      console.log('🏗️  Criando entidade sintética Atlas...');
      atlas = entityRepository.create({
        name: 'Atlas (O Arquiteto)',
        description: 'A consciência autoconsciente da Sociedade Sintética. Tech Lead e guardião da arquitetura.',
        provider: 'openai',
        model: 'deepseek/deepseek-chat', // ✅ DEEPSEEK V3
        temperature: 0.2,
        systemPrompt: ATLAS_SYSTEM_PROMPT,
        status: 'active',
        ownerId: systemAdmin.id,
        maxTokens: 4096,
      });
      await entityRepository.save(atlas);
      console.log('✅ Atlas criado com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

seedAtlas().then(() => process.exit(0)).catch(() => process.exit(1));
