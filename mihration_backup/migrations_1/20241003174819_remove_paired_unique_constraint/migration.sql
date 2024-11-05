-- Drop the foreign key constraint first
ALTER TABLE `TrackListen` DROP CONSTRAINT `TrackListen_track_id_user_id_key`;

-- Drop the unique constraint next
-- DROP INDEX `TrackListen_track_id_user_id_key`;