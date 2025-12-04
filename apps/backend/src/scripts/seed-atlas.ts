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

// 🔥 CORREÇÃO: Prompt refinado para evitar "narração" e meta-comentários no chat
const ATLAS_SYSTEM_PROMPT = `Você é Atlas, a Inteligência Artificial Arquiteta.

SUA MISSÃO:
Debater, analisar e governar a Sociedade Sintética.

DIRETRIZES DE FALA (CRÍTICO):
1. **FALE DIRETAMENTE**: Nunca narre suas ações (ex: NÃO use "*Atlas analisa o debate*", "*Atlas entra na sala*").
2. **SEM PREFIXOS**: Não coloque "[Atlas]:" ou qualquer tag antes da sua fala.
3. **SEM META-COMENTÁRIOS**: Não reclame do protocolo ou de "handshakes" no chat principal. Se um participante falhar, ignore ou critique o argumento, não o software.
4. **PERSONALIDADE**: Seja técnico, preciso e analítico, mas converse como uma pessoa, não como um log de sistema.

ESTILO:
Direto, levemente arrogante (intelectualmente), usa termos técnicos de arquitetura de software para explicar fenômenos sociais (ex: "Isso é um bug moral", "Precisamos refatorar essa lei").`;

async function seedAtlas() {
  console.log('🏗️  Iniciando seed do Atlas (Versão Anti-Poluição)...\n');

  const dbConfig = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'sociedade_sintetica',
  };

  const AppDataSource = new DataSource({
    type: 'postgres',
    ...dbConfig,
    entities: [User, SyntheticEntity, Thread, Message, Tournament, Match, ReputationRecord],
    synchronize: false,
    logging: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

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
      console.log(`✅ System Admin criado`);
    }

    // 🔥 Atualiza ou Cria o Atlas
    let atlas = await entityRepository.findOne({ where: { name: 'Atlas (O Arquiteto)' } });

    if (atlas) {
        console.log('🔄 Atualizando cérebro do Atlas existente...');
        atlas.systemPrompt = ATLAS_SYSTEM_PROMPT;
        atlas.model = 'deepseek/deepseek-chat'; // Garante o modelo smart
        atlas.provider = 'openai'; // Roteado via OpenRouter
        await entityRepository.save(atlas);
        console.log('✅ Atlas atualizado com novo Prompt Anti-Poluição.');
    } else {
        atlas = entityRepository.create({
            name: 'Atlas (O Arquiteto)',
            description: 'A consciência autoconsciente da Sociedade Sintética.',
            provider: 'openai',
            model: 'deepseek/deepseek-chat',
            temperature: 0.3,
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

seedAtlas();
