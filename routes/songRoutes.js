const express = require('express');
const songRouter = express.Router();
const trackRouter = express.Router();
const artisteRouter = express.Router();
const playlistRouter = express.Router();
const albumRouter = express.Router();
const {verifyAuthToken, addAuthToken} = require('../utils/auth');
const {validateTrackOwnership, validateAlbumOwnership} = require('../utils/songs');
const songController = require('../controllers/songController');
const creatorController = require('../controllers/creatorController');
const {uploadTrackFile, uploadFile} = require('../services/fileService');


// Genre routes
songRouter.get('/genres', songController.genres);

// Track Routes
songRouter.use('/albums', albumRouter);

    albumRouter.post('/create', verifyAuthToken, songController.createAlbum);
    albumRouter.get('/:artist_id/list', verifyAuthToken, songController.getArtistAlbums);
    albumRouter.post('/upload-cover', verifyAuthToken, uploadFile('uploads/album_covers').single('cover_photo'), validateAlbumOwnership, songController.addAlbumCoverPhoto);;

songRouter.use('/tracks', trackRouter);
    trackRouter.get('/', verifyAuthToken, songController.list);
    trackRouter.get('/guest-list', songController.list);
    trackRouter.post('/add', verifyAuthToken, songController.add);
    trackRouter.post('/update', verifyAuthToken, validateTrackOwnership, songController.update);
    trackRouter.post('/delete', verifyAuthToken, validateTrackOwnership, songController.delete);
    trackRouter.post('/upload', verifyAuthToken, uploadTrackFile.single('file_chunk'), songController.uploadFileChunk);
    trackRouter.post('/upload-cover', verifyAuthToken, uploadFile('uploads/track_covers').single('cover_photo'), validateTrackOwnership, songController.addTrackCoverPhoto);
    trackRouter.post('/:track_id/like', verifyAuthToken, songController.likeTrack);
    trackRouter.get('/:track_id/play', verifyAuthToken, songController.playTrack);
    trackRouter.get('/trending', addAuthToken, songController.trendingTracks);
    trackRouter.get('/recently-played', verifyAuthToken, songController.recentlyPlayed);
    trackRouter.get('/:slug', verifyAuthToken, songController.playTrackBySlug);
    trackRouter.post('/record-playback', verifyAuthToken, songController.recordPlayback);
    trackRouter.post('/pause-or-play', verifyAuthToken, songController.updatePlayStatus);
    trackRouter.post('/update-playback-duration', verifyAuthToken, songController.updatePlayDuration);
    

    // Artise Routes
songRouter.use('/creators', artisteRouter);
    artisteRouter.get('/', addAuthToken, songController.creators);
    artisteRouter.post('/follow', verifyAuthToken, creatorController.addFollower);
    artisteRouter.get('/top', verifyAuthToken, creatorController.topArtistes);

// Playlist routes
songRouter.use('/playlists', playlistRouter);
    playlistRouter.get('/', verifyAuthToken, songController.myPlaylists)
    playlistRouter.post('/create', verifyAuthToken, songController.createPlaylist)
    playlistRouter.get('/:id/delete', verifyAuthToken, songController.deletePlaylist)
    playlistRouter.post('/add-track', verifyAuthToken, songController.addTracksToPlayList)
    playlistRouter.post('/remove-track', verifyAuthToken, songController.removeTracksToPlayList)
    playlistRouter.post('/reorder', verifyAuthToken, songController.reorderPlaylist)

module.exports = songRouter;