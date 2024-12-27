/*
  Warnings:

  - You are about to drop the column `discussion_id` on the `tracks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tracks` DROP COLUMN `discussion_id`;

-- AddForeignKey
ALTER TABLE `discussions` ADD CONSTRAINT `discussions_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `tracks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
