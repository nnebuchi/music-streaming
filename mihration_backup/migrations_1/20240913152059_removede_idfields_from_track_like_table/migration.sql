/*
  Warnings:

  - The primary key for the `tracklike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `tracklike` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tracklike` DROP PRIMARY KEY,
    DROP COLUMN `id`;
