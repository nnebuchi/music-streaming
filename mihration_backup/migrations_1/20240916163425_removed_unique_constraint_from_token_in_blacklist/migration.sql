-- DropIndex
DROP INDEX `BlackListToken_token_key` ON `blacklisttoken`;

-- AlterTable
ALTER TABLE `blacklisttoken` MODIFY `token` TEXT NOT NULL;
