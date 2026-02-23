-- AlterTable
ALTER TABLE `User` ADD COLUMN `accessRoleIds` JSON NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `accessRoleId` VARCHAR(191) NULL;
