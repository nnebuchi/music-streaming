const notificationController = require('../controllers/notificationController');
const express = require('express');
const notificationRouter = express.Router();
const {verifyAuthToken} = require('../utils/auth');

notificationRouter.post('/save-fcm-token',verifyAuthToken, notificationController.saveFcmToken);

module.exports = notificationRouter;