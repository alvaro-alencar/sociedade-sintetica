import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableVectorExtension1701234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ativa a extensão vector se ela ainda não existir
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Não removemos a extensão no rollback para evitar perda de dados se outras tabelas usarem
        // await queryRunner.query(`DROP EXTENSION IF EXISTS vector;`);
    }
}
