/*
  Warnings:

  - You are about to alter the column `duration` on the `tracklisten` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `tracklisten` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `duration` INTEGER NOT NULL;
