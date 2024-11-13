const express = require('express');
const storeRouter = express.Router();
const storeController = require('../controllers/storeController');

storeRouter.get('/products', storeController.getProducts);

module.exports = storeRouter;