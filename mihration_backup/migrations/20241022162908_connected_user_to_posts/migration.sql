/*
  Warnings:

  - You are about to drop the `_discussionstousers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_discussionstousers` DROP FOREIGN KEY `_DiscussionsToUsers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_discussionstousers` DROP FOREIGN KEY `_DiscussionsToUsers_B_fkey`;

-- DropTable
DROP TABLE `_discussionstousers`;

-- AddForeignKey
ALTER TABLE `Discussions` ADD CONSTRAINT `Discussions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
