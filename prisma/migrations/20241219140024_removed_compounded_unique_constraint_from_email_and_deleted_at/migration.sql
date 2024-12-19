-- DropIndex
DROP INDEX `users_email_deleted_at_key` ON `users`;

-- AlterTable
ALTER TABLE `users` MODIFY `email` VARCHAR(191) NULL;
