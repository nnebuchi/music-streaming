-- AddForeignKey
ALTER TABLE `Tracks` ADD CONSTRAINT `Tracks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
