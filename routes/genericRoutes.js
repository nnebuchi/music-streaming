const express = require('express');
const genericRouter = express.Router();
const genericController = require('../controllers/genericController');


genericRouter.post('/version', genericController.version);
// genericRouter.get('/store-seeder', genericController.storeSeeder);
genericRouter.get('/generate-track-discussions', genericController.trackDiscussion);
module.exports = genericRouter;