/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Tracks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `tracks` MODIFY `title` VARCHAR(191) NULL,
    MODIFY `duration` INTEGER NULL,
    MODIFY `cover` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `TrackToGenres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `track_id` INTEGER NOT NULL,
    `genre_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Tracks_slug_key` ON `Tracks`(`slug`);

-- AddForeignKey
ALTER TABLE `TrackToGenres` ADD CONSTRAINT `TrackToGenres_track_id_fkey` FOREIGN KEY (`track_id`) REFERENCES `Tracks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackToGenres` ADD CONSTRAINT `TrackToGenres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `Genres`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
