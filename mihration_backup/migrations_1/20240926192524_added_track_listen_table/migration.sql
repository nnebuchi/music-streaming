-- AlterTable
ALTER TABLE `playback_progress` ADD COLUMN `time_spent` INTEGER NOT NULL DEFAULT 1,
    MODIFY `playback_position` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `tracks` ADD COLUMN `video_file` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `TrackListen` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `track_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TrackListen_track_id_user_id_key`(`track_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TrackListen` ADD CONSTRAINT `TrackListen_track_id_fkey` FOREIGN KEY (`track_id`) REFERENCES `Tracks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackListen` ADD CONSTRAINT `TrackListen_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
