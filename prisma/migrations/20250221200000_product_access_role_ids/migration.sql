-- Add new column
ALTER TABLE `Product` ADD COLUMN `accessRoleIds` JSON NULL;

-- Migrate existing single accessRoleId into array
UPDATE `Product` SET `accessRoleIds` = JSON_ARRAY(`accessRoleId`) WHERE `accessRoleId` IS NOT NULL;

-- Drop old column
ALTER TABLE `Product` DROP COLUMN `accessRoleId`;
