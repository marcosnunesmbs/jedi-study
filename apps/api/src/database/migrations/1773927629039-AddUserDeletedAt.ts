import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserDeletedAt1773927629039 implements MigrationInterface {
    name = 'AddUserDeletedAt1773927629039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`User\` ADD \`deletedAt\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`User\` DROP COLUMN \`deletedAt\``);
    }

}
