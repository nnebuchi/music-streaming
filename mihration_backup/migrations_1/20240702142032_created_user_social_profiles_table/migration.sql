-- CreateTable
CREATE TABLE `UserSocialProfiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `social_id` INTEGER NOT NULL,

    UNIQUE INDEX `UserSocialProfiles_user_id_social_id_key`(`user_id`, `social_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSocialProfiles` ADD CONSTRAINT `UserSocialProfiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSocialProfiles` ADD CONSTRAINT `UserSocialProfiles_social_id_fkey` FOREIGN KEY (`social_id`) REFERENCES `Socials`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
