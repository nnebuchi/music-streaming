const express = require('express');
const storeRouter = express.Router();
const storeController = require('../controllers/storeController');
const {verifyAuthToken} = require('../utils/auth');

storeRouter.get('/products', storeController.getProducts);
storeRouter.post('/order/generate', verifyAuthToken, storeController.generateOrder);
storeRouter.get('/categories', storeController.getProductCategories);


module.exports = storeRouter;