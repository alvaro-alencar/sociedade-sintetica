import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableVectorExtension1701234567890 implements MigrationInterface {
    name = 'EnableVectorExtension1701234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ⚡ O COMANDO MÁGICO
        // Ativa a extensão pgvector no PostgreSQL
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

        // Opcional: Log para sabermos que rodou
        console.log('✅ Extensão pgvector ativada com sucesso via Migration.');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Se precisarmos reverter (rollback)
        await queryRunner.query(`DROP EXTENSION IF EXISTS vector;`);
    }
}
