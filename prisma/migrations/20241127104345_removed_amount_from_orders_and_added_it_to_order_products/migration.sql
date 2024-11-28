/*
  Warnings:

  - You are about to drop the column `amount` on the `orders` table. All the data in the column will be lost.
  - Added the required column `amount` to the `order_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order_products` ADD COLUMN `amount` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `amount`;
