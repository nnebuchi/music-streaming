const storeService = require("../services/storeService");

const url = require('url');

exports.getProducts = async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    return storeService.getProducts(parsedUrl, res);
};