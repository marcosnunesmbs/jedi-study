import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskGenerationRedesign1774033329042 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns (idempotent — skip if already exists from partial first run)
    const taskColumns = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Task'`,
    );
    const existingCols = new Set(taskColumns.map((r: any) => r.COLUMN_NAME));

    if (!existingCols.has('prompt')) {
      await queryRunner.query(`ALTER TABLE \`Task\` ADD \`prompt\` TEXT NULL`);
    }
    if (!existingCols.has('expectedResponseFormat')) {
      await queryRunner.query(`ALTER TABLE \`Task\` ADD \`expectedResponseFormat\` VARCHAR(255) NULL`);
    }
    if (!existingCols.has('evaluationCriteria')) {
      await queryRunner.query(`ALTER TABLE \`Task\` ADD \`evaluationCriteria\` TEXT NULL`);
    }
    if (!existingCols.has('hints')) {
      await queryRunner.query(`ALTER TABLE \`Task\` ADD \`hints\` TEXT NULL`);
    }

    // Update existing task types to CONCEPTUAL
    await queryRunner.query(`UPDATE \`Task\` SET \`type\` = 'CONCEPTUAL' WHERE \`type\` IN ('READING', 'EXERCISE', 'PROJECT', 'QUIZ')`);

    // For existing tasks, copy description to prompt so they remain functional
    await queryRunner.query(`UPDATE \`Task\` SET \`prompt\` = \`description\` WHERE \`prompt\` IS NULL`);

    // Change default for type column
    await queryRunner.query(`ALTER TABLE \`Task\` ALTER COLUMN \`type\` SET DEFAULT 'CONCEPTUAL'`);

    // Remove projectContext column (idempotent)
    if (existingCols.has('projectContext')) {
      await queryRunner.query(`ALTER TABLE \`Task\` DROP COLUMN \`projectContext\``);
    }

    // Update AgentModelConfig enum: replace PROJECT_ANALYZER with TASK_GENERATOR
    // IMPORTANT: First add TASK_GENERATOR to the enum (keeping PROJECT_ANALYZER temporarily),
    // then update data, then remove PROJECT_ANALYZER from the enum.
    await queryRunner.query(`ALTER TABLE \`AgentModelConfig\` MODIFY COLUMN \`agentType\` ENUM('CONTENT_GEN','PATH_GENERATOR','TASK_ANALYZER','PROJECT_ANALYZER','TASK_GENERATOR','SAFETY') NOT NULL`);
    await queryRunner.query(`UPDATE \`AgentModelConfig\` SET \`agentType\` = 'TASK_GENERATOR' WHERE \`agentType\` = 'PROJECT_ANALYZER'`);
    await queryRunner.query(`ALTER TABLE \`AgentModelConfig\` MODIFY COLUMN \`agentType\` ENUM('CONTENT_GEN','PATH_GENERATOR','TASK_ANALYZER','TASK_GENERATOR','SAFETY') NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert AgentModelConfig enum (add PROJECT_ANALYZER, update data, remove TASK_GENERATOR)
    await queryRunner.query(`ALTER TABLE \`AgentModelConfig\` MODIFY COLUMN \`agentType\` ENUM('CONTENT_GEN','PATH_GENERATOR','TASK_ANALYZER','PROJECT_ANALYZER','TASK_GENERATOR','SAFETY') NOT NULL`);
    await queryRunner.query(`UPDATE \`AgentModelConfig\` SET \`agentType\` = 'PROJECT_ANALYZER' WHERE \`agentType\` = 'TASK_GENERATOR'`);
    await queryRunner.query(`ALTER TABLE \`AgentModelConfig\` MODIFY COLUMN \`agentType\` ENUM('CONTENT_GEN','PATH_GENERATOR','TASK_ANALYZER','PROJECT_ANALYZER','SAFETY') NOT NULL`);

    // Re-add projectContext
    await queryRunner.query(`ALTER TABLE \`Task\` ADD \`projectContext\` TEXT NULL`);

    // Revert default
    await queryRunner.query(`ALTER TABLE \`Task\` ALTER COLUMN \`type\` SET DEFAULT 'EXERCISE'`);

    // Revert types
    await queryRunner.query(`UPDATE \`Task\` SET \`type\` = 'EXERCISE' WHERE \`type\` = 'CONCEPTUAL'`);

    // Remove new columns
    await queryRunner.query(`ALTER TABLE \`Task\` DROP COLUMN \`hints\``);
    await queryRunner.query(`ALTER TABLE \`Task\` DROP COLUMN \`evaluationCriteria\``);
    await queryRunner.query(`ALTER TABLE \`Task\` DROP COLUMN \`expectedResponseFormat\``);
    await queryRunner.query(`ALTER TABLE \`Task\` DROP COLUMN \`prompt\``);
  }
}
