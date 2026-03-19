import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1773927629038 implements MigrationInterface {
    name = 'InitialSchema1773927629038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Analysis\` (\`id\` varchar(255) NOT NULL, \`submissionId\` varchar(255) NOT NULL, \`agentType\` varchar(255) NOT NULL, \`feedback\` text NOT NULL, \`strengths\` text NOT NULL, \`improvements\` text NOT NULL, \`score\` int NOT NULL, \`passed\` tinyint NOT NULL, \`rawOutput\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3fd766e8d4f65062138fd59ee4\` (\`submissionId\`), UNIQUE INDEX \`REL_3fd766e8d4f65062138fd59ee4\` (\`submissionId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Submission\` (\`id\` varchar(255) NOT NULL, \`taskId\` varchar(255) NOT NULL, \`attempt\` int NOT NULL, \`content\` text NOT NULL, \`contentType\` varchar(255) NOT NULL DEFAULT 'TEXT', \`status\` varchar(255) NOT NULL DEFAULT 'PENDING', \`score\` int NULL, \`passed\` tinyint NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_686d44fa183b9e5962f1912820\` (\`taskId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Task\` (\`id\` varchar(255) NOT NULL, \`phaseId\` varchar(255) NOT NULL, \`order\` int NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`type\` varchar(255) NOT NULL DEFAULT 'EXERCISE', \`status\` varchar(255) NOT NULL DEFAULT 'PENDING', \`projectContext\` text NULL, \`maxScore\` int NOT NULL DEFAULT '100', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_3ff57af9cfd0bb17b1388b58fc\` (\`phaseId\`), UNIQUE INDEX \`IDX_6e7f532e0c1e48387ab87d395d\` (\`phaseId\`, \`order\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Content\` (\`id\` varchar(255) NOT NULL, \`phaseId\` varchar(255) NOT NULL, \`topic\` varchar(255) NULL, \`type\` varchar(255) NOT NULL DEFAULT 'EXPLANATION', \`title\` varchar(255) NOT NULL, \`body\` text NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'PENDING', \`jobId\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_8d33d4b464dc2fbaeba5e27058\` (\`phaseId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Phase\` (\`id\` varchar(255) NOT NULL, \`studyPathId\` varchar(255) NOT NULL, \`order\` int NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`objectives\` text NOT NULL, \`topics\` text NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'LOCKED', \`estimatedHours\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_6bcfe12b6060ea10a64f4939d0\` (\`studyPathId\`), UNIQUE INDEX \`IDX_c5bc28b89b312e8283473eb382\` (\`studyPathId\`, \`order\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`StudyPath\` (\`id\` varchar(255) NOT NULL, \`subjectId\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`version\` int NOT NULL DEFAULT '1', \`isActive\` tinyint NOT NULL DEFAULT 1, \`status\` varchar(255) NOT NULL DEFAULT 'GENERATING', \`rawAgentOutput\` text NULL, \`estimatedHours\` int NOT NULL DEFAULT '0', \`totalPhases\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_ec4088955319174c8f9802da69\` (\`subjectId\`), INDEX \`IDX_a75f7dbc6d98c86d47a56e0e3b\` (\`userId\`), INDEX \`IDX_e5b96c4bc0f43a9b5fc616cc24\` (\`subjectId\`, \`isActive\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Subject\` (\`id\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`skillLevel\` varchar(255) NOT NULL DEFAULT 'BEGINNER', \`goals\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_0f974e64101442326c8bc8255f\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`TokenUsage\` (\`id\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`agentType\` varchar(255) NOT NULL, \`referenceId\` varchar(255) NOT NULL, \`referenceType\` varchar(255) NOT NULL, \`model\` varchar(255) NOT NULL, \`inputTokens\` int NOT NULL, \`outputTokens\` int NOT NULL, \`totalTokens\` int NOT NULL, \`estimatedCostUsd\` float NOT NULL DEFAULT '0', \`durationMs\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_a313114d350cf8809c20fa110c\` (\`userId\`), INDEX \`IDX_2e6d986113748c4444566600d3\` (\`agentType\`), INDEX \`IDX_c4a9fdd1add6d6c22cdcc0a155\` (\`referenceId\`), INDEX \`IDX_0d42c997b2ae42a78b908f73ed\` (\`createdAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`User\` (\`id\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`displayName\` varchar(255) NULL, \`role\` enum ('USER', 'ADMIN') NOT NULL DEFAULT 'USER', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_4a257d2c9837248d70640b3e36\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`AgentJob\` (\`id\` varchar(255) NOT NULL, \`bullJobId\` varchar(255) NULL, \`type\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'QUEUED', \`referenceId\` varchar(255) NOT NULL, \`error\` varchar(255) NULL, \`startedAt\` datetime NULL, \`completedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_a74b04b7593987aae1f84fa96e\` (\`status\`), INDEX \`IDX_0760a12ab4a5a8d4ebe65aa4c0\` (\`referenceId\`), UNIQUE INDEX \`IDX_429c8e63f24cddfdc263e5d619\` (\`bullJobId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Analysis\` ADD CONSTRAINT \`FK_3fd766e8d4f65062138fd59ee43\` FOREIGN KEY (\`submissionId\`) REFERENCES \`Submission\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Submission\` ADD CONSTRAINT \`FK_686d44fa183b9e5962f19128205\` FOREIGN KEY (\`taskId\`) REFERENCES \`Task\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Task\` ADD CONSTRAINT \`FK_3ff57af9cfd0bb17b1388b58fc5\` FOREIGN KEY (\`phaseId\`) REFERENCES \`Phase\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Content\` ADD CONSTRAINT \`FK_8d33d4b464dc2fbaeba5e27058d\` FOREIGN KEY (\`phaseId\`) REFERENCES \`Phase\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Phase\` ADD CONSTRAINT \`FK_6bcfe12b6060ea10a64f4939d04\` FOREIGN KEY (\`studyPathId\`) REFERENCES \`StudyPath\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`StudyPath\` ADD CONSTRAINT \`FK_ec4088955319174c8f9802da695\` FOREIGN KEY (\`subjectId\`) REFERENCES \`Subject\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`StudyPath\` ADD CONSTRAINT \`FK_a75f7dbc6d98c86d47a56e0e3ba\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Subject\` ADD CONSTRAINT \`FK_0f974e64101442326c8bc8255f2\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`TokenUsage\` ADD CONSTRAINT \`FK_a313114d350cf8809c20fa110cf\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`TokenUsage\` DROP FOREIGN KEY \`FK_a313114d350cf8809c20fa110cf\``);
        await queryRunner.query(`ALTER TABLE \`Subject\` DROP FOREIGN KEY \`FK_0f974e64101442326c8bc8255f2\``);
        await queryRunner.query(`ALTER TABLE \`StudyPath\` DROP FOREIGN KEY \`FK_a75f7dbc6d98c86d47a56e0e3ba\``);
        await queryRunner.query(`ALTER TABLE \`StudyPath\` DROP FOREIGN KEY \`FK_ec4088955319174c8f9802da695\``);
        await queryRunner.query(`ALTER TABLE \`Phase\` DROP FOREIGN KEY \`FK_6bcfe12b6060ea10a64f4939d04\``);
        await queryRunner.query(`ALTER TABLE \`Content\` DROP FOREIGN KEY \`FK_8d33d4b464dc2fbaeba5e27058d\``);
        await queryRunner.query(`ALTER TABLE \`Task\` DROP FOREIGN KEY \`FK_3ff57af9cfd0bb17b1388b58fc5\``);
        await queryRunner.query(`ALTER TABLE \`Submission\` DROP FOREIGN KEY \`FK_686d44fa183b9e5962f19128205\``);
        await queryRunner.query(`ALTER TABLE \`Analysis\` DROP FOREIGN KEY \`FK_3fd766e8d4f65062138fd59ee43\``);
        await queryRunner.query(`DROP INDEX \`IDX_429c8e63f24cddfdc263e5d619\` ON \`AgentJob\``);
        await queryRunner.query(`DROP INDEX \`IDX_0760a12ab4a5a8d4ebe65aa4c0\` ON \`AgentJob\``);
        await queryRunner.query(`DROP INDEX \`IDX_a74b04b7593987aae1f84fa96e\` ON \`AgentJob\``);
        await queryRunner.query(`DROP TABLE \`AgentJob\``);
        await queryRunner.query(`DROP INDEX \`IDX_4a257d2c9837248d70640b3e36\` ON \`User\``);
        await queryRunner.query(`DROP TABLE \`User\``);
        await queryRunner.query(`DROP INDEX \`IDX_0d42c997b2ae42a78b908f73ed\` ON \`TokenUsage\``);
        await queryRunner.query(`DROP INDEX \`IDX_c4a9fdd1add6d6c22cdcc0a155\` ON \`TokenUsage\``);
        await queryRunner.query(`DROP INDEX \`IDX_2e6d986113748c4444566600d3\` ON \`TokenUsage\``);
        await queryRunner.query(`DROP INDEX \`IDX_a313114d350cf8809c20fa110c\` ON \`TokenUsage\``);
        await queryRunner.query(`DROP TABLE \`TokenUsage\``);
        await queryRunner.query(`DROP INDEX \`IDX_0f974e64101442326c8bc8255f\` ON \`Subject\``);
        await queryRunner.query(`DROP TABLE \`Subject\``);
        await queryRunner.query(`DROP INDEX \`IDX_e5b96c4bc0f43a9b5fc616cc24\` ON \`StudyPath\``);
        await queryRunner.query(`DROP INDEX \`IDX_a75f7dbc6d98c86d47a56e0e3b\` ON \`StudyPath\``);
        await queryRunner.query(`DROP INDEX \`IDX_ec4088955319174c8f9802da69\` ON \`StudyPath\``);
        await queryRunner.query(`DROP TABLE \`StudyPath\``);
        await queryRunner.query(`DROP INDEX \`IDX_c5bc28b89b312e8283473eb382\` ON \`Phase\``);
        await queryRunner.query(`DROP INDEX \`IDX_6bcfe12b6060ea10a64f4939d0\` ON \`Phase\``);
        await queryRunner.query(`DROP TABLE \`Phase\``);
        await queryRunner.query(`DROP INDEX \`IDX_8d33d4b464dc2fbaeba5e27058\` ON \`Content\``);
        await queryRunner.query(`DROP TABLE \`Content\``);
        await queryRunner.query(`DROP INDEX \`IDX_6e7f532e0c1e48387ab87d395d\` ON \`Task\``);
        await queryRunner.query(`DROP INDEX \`IDX_3ff57af9cfd0bb17b1388b58fc\` ON \`Task\``);
        await queryRunner.query(`DROP TABLE \`Task\``);
        await queryRunner.query(`DROP INDEX \`IDX_686d44fa183b9e5962f1912820\` ON \`Submission\``);
        await queryRunner.query(`DROP TABLE \`Submission\``);
        await queryRunner.query(`DROP INDEX \`REL_3fd766e8d4f65062138fd59ee4\` ON \`Analysis\``);
        await queryRunner.query(`DROP INDEX \`IDX_3fd766e8d4f65062138fd59ee4\` ON \`Analysis\``);
        await queryRunner.query(`DROP TABLE \`Analysis\``);
    }

}
