import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInputToContent1773986998164 implements MigrationInterface {
    name = 'AddInputToContent1773986998164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Content\` ADD \`input\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Content\` DROP COLUMN \`input\``);
    }
}
