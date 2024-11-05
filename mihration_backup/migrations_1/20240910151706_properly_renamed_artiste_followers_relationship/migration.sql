/*
  Warnings:

  - You are about to drop the `artistetolistener` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `artistetolistener` DROP FOREIGN KEY `ArtisteToListener_artiste_id_fkey`;

-- DropForeignKey
ALTER TABLE `artistetolistener` DROP FOREIGN KEY `ArtisteToListener_listener_id_fkey`;

-- DropTable
DROP TABLE `artistetolistener`;

-- CreateTable
CREATE TABLE `ArtisteToFollower` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `artiste_id` INTEGER NOT NULL,
    `follower_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ArtisteToFollower` ADD CONSTRAINT `ArtisteToFollower_artiste_id_fkey` FOREIGN KEY (`artiste_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArtisteToFollower` ADD CONSTRAINT `ArtisteToFollower_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
