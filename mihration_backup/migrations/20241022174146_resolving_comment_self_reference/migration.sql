-- AlterTable
ALTER TABLE `discussioncomments` MODIFY `parent` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DiscussionComments` ADD CONSTRAINT `DiscussionComments_parent_fkey` FOREIGN KEY (`parent`) REFERENCES `DiscussionComments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
