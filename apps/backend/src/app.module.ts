import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { SyntheticEntitiesModule } from './modules/synthetic-entities/synthetic-entities.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { ReputationModule } from './modules/reputation/reputation.module';
import { LLMConnectorModule } from './modules/llm-connector/llm-connector.module';
import { HealthModule } from './modules/health/health.module';
import { User } from './database/entities/user.entity';
import { SyntheticEntity } from './database/entities/synthetic-entity.entity';
import { Thread } from './database/entities/thread.entity';
import { Message } from './database/entities/message.entity';
import { Tournament } from './database/entities/tournament.entity';
import { Match } from './database/entities/match.entity';
import { ReputationRecord } from './database/entities/reputation-record.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'sociedade_sintetica',
      entities: [
        User,
        SyntheticEntity,
        Thread,
        Message,
        Tournament,
        Match,
        ReputationRecord,
      ],
      synchronize: true, // Only for dev!
    }),
    AuthModule,
    AccountsModule,
    SyntheticEntitiesModule,
    ConversationsModule,
    TournamentsModule,
    ReputationModule,
    LLMConnectorModule,
    HealthModule,
  ],
})
export class AppModule {}
