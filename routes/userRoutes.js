const express = require('express');
const userRouter = express.Router();
const {verifyAuthToken} = require('../utils/auth');
const userController = require('../controllers/userController');
const {uploadFile} = require('../services/fileService');

// const ProfileRoutes = express.R

// userRouter.use('/profile', ProfileRoutes);
userRouter.get('/profile', verifyAuthToken, userController.profile);
userRouter.post('/profile/update', verifyAuthToken, userController.updateProfile);
userRouter.get('/profile/socials',verifyAuthToken, userController.socials);
userRouter.post('/profile/socials/update', verifyAuthToken, userController.updateSocials);
userRouter.post('/change-password', verifyAuthToken, userController.changePassword);
userRouter.post('/delete-account', verifyAuthToken, userController.deleteAccount);
userRouter.post(
    '/update-profile-photo',
    verifyAuthToken,
    uploadFile('uploads/profile_photos').single('photo'),
    userController.updateProfilePhoto
  );
// userRouter.post('/update-profile-photo', verifyAuthToken, uploadProfilePhoto('profile_photos').single('photo'), userController.updateProfilePhoto);
userRouter.post(
    '/update-cover-photo',
    verifyAuthToken,
    uploadFile('uploads/cover_photos').single('photo'),
    userController.updateCoverPhoto
  );
// userRouter.post('/update-cover-photo', verifyAuthToken, uploadCoverPhoto.single('photo'), userController.updateCoverPhoto);
userRouter.get('/followers', verifyAuthToken, userController.getFollowers);
userRouter.get('/followings', verifyAuthToken, userController.getFollowings);
userRouter.get('/liked-tracks', verifyAuthToken, userController.getLikedTracks);
module.exports = userRouter;