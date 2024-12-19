-- CreateTable
CREATE TABLE `personal_access_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tokenable_type` VARCHAR(191) NOT NULL,
    `tokenable_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `abilities` TEXT NULL,
    `last_used_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `personal_access_tokens_token_key`(`token`),
    INDEX `personal_access_tokens_tokenable_type_tokenable_id_idx`(`tokenable_type`, `tokenable_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
