/*
  Warnings:

  - You are about to drop the column `product_id` on the `orders` table. All the data in the column will be lost.
  - Added the required column `code` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_product_id_fkey`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `product_id`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `order_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `order_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_products` ADD CONSTRAINT `order_products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_products` ADD CONSTRAINT `order_products_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
