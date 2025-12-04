import * as dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SyntheticEntity } from '../database/entities/synthetic-entity.entity';
import { User } from '../database/entities/user.entity';
import { Thread } from '../database/entities/thread.entity';
import { Message } from '../database/entities/message.entity';
import { Tournament } from '../database/entities/tournament.entity';
import { Match } from '../database/entities/match.entity';
import { ReputationRecord } from '../database/entities/reputation-record.entity';

async function fixModels() {
  console.log('🔧 Iniciando Migração para Plano Gratuito (OpenRouter Free Tier)...\n');

  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'sociedade_sintetica',
    entities: [User, SyntheticEntity, Thread, Message, Tournament, Match, ReputationRecord],
    synchronize: false,
    logging: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    const entityRepository = AppDataSource.getRepository(SyntheticEntity);
    const allEntities = await entityRepository.find();

    console.log(`🔍 Encontradas ${allEntities.length} entidades. Aplicando modelos gratuitos...`);

    // Lista de modelos gratuitos do OpenRouter
    const freeModels = [
      'google/gemini-2.0-flash-exp:free', // Muito rápido e inteligente
      'meta-llama/llama-3.2-11b-vision-instruct:free', // Ótimo para chat
      'microsoft/phi-3-mini-128k-instruct:free', // Leve e rápido
    ];

    for (let i = 0; i < allEntities.length; i++) {
      const entity = allEntities[i];
      // Distribui os modelos entre as entidades para dar variedade
      const selectedModel = freeModels[i % freeModels.length];

      console.log(`   - ${entity.name} agora usa: ${selectedModel}`);

      entity.model = selectedModel;
      entity.provider = 'openai'; // Connector usa isso para rotear

      await entityRepository.save(entity);
    }

    console.log('\n✅ Migração concluída! Reinicie o backend para aplicar.');

  } catch (error) {
    console.error('❌ Erro durante o fix:', error);
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

fixModels();
