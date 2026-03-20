import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWelcomeMessageToStudyPath1774033329040 implements MigrationInterface {
    name = 'AddWelcomeMessageToStudyPath1774033329040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`StudyPath\` ADD \`welcomeMessage\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`StudyPath\` DROP COLUMN \`welcomeMessage\``);
    }
}
