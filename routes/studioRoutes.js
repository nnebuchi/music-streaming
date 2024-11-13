const express = require('express');
const studioRouter = express.Router();

const studioController = require('../controllers/studioController');
const {verifyAuthToken} = require('../utils/auth');

studioRouter.post('/book', verifyAuthToken, studioController.bookStudio);

module.exports = studioRouter;