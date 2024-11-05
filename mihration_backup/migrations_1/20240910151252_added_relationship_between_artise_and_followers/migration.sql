-- CreateTable
CREATE TABLE `ArtisteToListener` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `artiste_id` INTEGER NOT NULL,
    `listener_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ArtisteToListener` ADD CONSTRAINT `ArtisteToListener_artiste_id_fkey` FOREIGN KEY (`artiste_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArtisteToListener` ADD CONSTRAINT `ArtisteToListener_listener_id_fkey` FOREIGN KEY (`listener_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
