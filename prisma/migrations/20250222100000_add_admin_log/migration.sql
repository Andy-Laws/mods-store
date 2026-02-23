-- CreateTable
CREATE TABLE `AdminLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `meta` JSON NULL,
    `userId` VARCHAR(191) NULL,

    INDEX `AdminLog_createdAt_idx`(`createdAt`),
    INDEX `AdminLog_type_idx`(`type`),
    INDEX `AdminLog_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminLog` ADD CONSTRAINT `AdminLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
