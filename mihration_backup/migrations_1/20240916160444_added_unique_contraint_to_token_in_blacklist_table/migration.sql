/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `BlackListToken` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `blacklisttoken` MODIFY `token` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `BlackListToken_token_key` ON `BlackListToken`(`token`);
