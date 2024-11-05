/*
  Warnings:

  - A unique constraint covering the columns `[track_id,user_id]` on the table `TrackLike` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TrackLike_track_id_user_id_key` ON `TrackLike`(`track_id`, `user_id`);
