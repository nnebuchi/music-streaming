/*
  Warnings:

  - You are about to drop the column `likedAt` on the `tracklike` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tracklike` DROP COLUMN `likedAt`;

-- CreateTable
CREATE TABLE `BlackListToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` TEXT NOT NULL,
    `exp` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
