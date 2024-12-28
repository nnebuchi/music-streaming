const { runValidation } = require("../lib/buchi");
const storeService = require("../services/storeService");

const url = require('url');

exports.getProducts = async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    return storeService.getProducts(parsedUrl, res);
};

exports.generateOrder = async (req, res) => {
    const validate = await runValidation([
        {
            input: { value: req.body.products, field: "products", type: "array" },
            rules: { required: true },
        }
    ]);

    if (validate?.status === false) {
        return res.status(409).json({
            status: "fail",
            errors: validate.errors,
            message: "Request Failed",
        });
    }
    return storeService.generateOrder(req, res);
};

exports.getProductCategories = async (req, res) => {
    return storeService.getProductCategories(res);
}