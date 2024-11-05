/*
  Warnings:

  - Added the required column `description` to the `Albums` table without a default value. This is not possible if the table is not empty.
  - Added the required column `album_id` to the `Tracks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `albums` ADD COLUMN `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `tracks` ADD COLUMN `album_id` INTEGER NOT NULL;
