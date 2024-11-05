-- AlterTable
ALTER TABLE `tracks` ADD COLUMN `featured` VARCHAR(191) NULL,
    ADD COLUMN `release_date` VARCHAR(191) NULL,
    MODIFY `file` VARCHAR(191) NULL;
