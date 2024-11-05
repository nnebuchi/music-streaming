/*
  Warnings:

  - You are about to drop the `playback_progress` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `duration` to the `TrackListen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tracklisten` ADD COLUMN `duration` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'playing',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `playback_progress`;
