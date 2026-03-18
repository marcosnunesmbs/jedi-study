-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `skillLevel` VARCHAR(191) NOT NULL DEFAULT 'BEGINNER',
    `goals` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Subject_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudyPath` (
    `id` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(191) NOT NULL DEFAULT 'GENERATING',
    `rawAgentOutput` TEXT NULL,
    `estimatedHours` INTEGER NOT NULL DEFAULT 0,
    `totalPhases` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudyPath_subjectId_isActive_idx`(`subjectId`, `isActive`),
    INDEX `StudyPath_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Phase` (
    `id` VARCHAR(191) NOT NULL,
    `studyPathId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `objectives` TEXT NOT NULL,
    `topics` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'LOCKED',
    `estimatedHours` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Phase_studyPathId_idx`(`studyPathId`),
    UNIQUE INDEX `Phase_studyPathId_order_key`(`studyPathId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` VARCHAR(191) NOT NULL,
    `phaseId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'EXERCISE',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `projectContext` TEXT NULL,
    `maxScore` INTEGER NOT NULL DEFAULT 100,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Task_phaseId_idx`(`phaseId`),
    UNIQUE INDEX `Task_phaseId_order_key`(`phaseId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `attempt` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `contentType` VARCHAR(191) NOT NULL DEFAULT 'TEXT',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `score` INTEGER NULL,
    `passed` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Submission_taskId_idx`(`taskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Analysis` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `agentType` VARCHAR(191) NOT NULL,
    `feedback` TEXT NOT NULL,
    `strengths` TEXT NOT NULL,
    `improvements` TEXT NOT NULL,
    `score` INTEGER NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `rawOutput` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Analysis_submissionId_key`(`submissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Content` (
    `id` VARCHAR(191) NOT NULL,
    `phaseId` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'EXPLANATION',
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `jobId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Content_phaseId_idx`(`phaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentJob` (
    `id` VARCHAR(191) NOT NULL,
    `bullJobId` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'QUEUED',
    `referenceId` VARCHAR(191) NOT NULL,
    `error` VARCHAR(191) NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AgentJob_bullJobId_key`(`bullJobId`),
    INDEX `AgentJob_referenceId_idx`(`referenceId`),
    INDEX `AgentJob_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TokenUsage` (
    `id` VARCHAR(191) NOT NULL,
    `agentType` VARCHAR(191) NOT NULL,
    `referenceId` VARCHAR(191) NOT NULL,
    `referenceType` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `inputTokens` INTEGER NOT NULL,
    `outputTokens` INTEGER NOT NULL,
    `totalTokens` INTEGER NOT NULL,
    `estimatedCostUsd` DOUBLE NOT NULL DEFAULT 0,
    `durationMs` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TokenUsage_agentType_idx`(`agentType`),
    INDEX `TokenUsage_createdAt_idx`(`createdAt`),
    INDEX `TokenUsage_referenceId_idx`(`referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudyPath` ADD CONSTRAINT `StudyPath_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudyPath` ADD CONSTRAINT `StudyPath_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Phase` ADD CONSTRAINT `Phase_studyPathId_fkey` FOREIGN KEY (`studyPathId`) REFERENCES `StudyPath`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_phaseId_fkey` FOREIGN KEY (`phaseId`) REFERENCES `Phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Analysis` ADD CONSTRAINT `Analysis_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_phaseId_fkey` FOREIGN KEY (`phaseId`) REFERENCES `Phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
