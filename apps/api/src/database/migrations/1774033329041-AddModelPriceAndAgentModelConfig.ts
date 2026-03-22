import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModelPriceAndAgentModelConfig1774033329041 implements MigrationInterface {
    name = 'AddModelPriceAndAgentModelConfig1774033329041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`ModelPrice\` (
                \`id\` varchar(255) NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`provider\` varchar(50) NOT NULL DEFAULT 'google',
                \`inputPricePer1M\` float(10,6) NOT NULL,
                \`outputPricePer1M\` float(10,6) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_ModelPrice_name\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`AgentModelConfig\` (
                \`id\` varchar(255) NOT NULL,
                \`agentType\` enum('CONTENT_GEN','PATH_GENERATOR','TASK_ANALYZER','PROJECT_ANALYZER','SAFETY') NOT NULL,
                \`modelPriceId\` varchar(255) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_AgentModelConfig_agentType\` (\`agentType\`),
                INDEX \`IDX_AgentModelConfig_modelPriceId\` (\`modelPriceId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            ALTER TABLE \`AgentModelConfig\`
            ADD CONSTRAINT \`FK_AgentModelConfig_modelPriceId\`
            FOREIGN KEY (\`modelPriceId\`) REFERENCES \`ModelPrice\`(\`id\`) ON DELETE RESTRICT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`AgentModelConfig\` DROP FOREIGN KEY \`FK_AgentModelConfig_modelPriceId\``);
        await queryRunner.query(`DROP TABLE \`AgentModelConfig\``);
        await queryRunner.query(`DROP TABLE \`ModelPrice\``);
    }
}