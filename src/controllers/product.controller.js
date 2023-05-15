'use strict'

const ProductService = require("../services/product.service");
const {SuccessResponse} = require("../core/success.response");

class ProductController{
    createProduct = async (req, res, next) => {
        console.log('day la product ',req.body);
        new SuccessResponse({
            message: 'Create new Product success',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'publish Product success',
            metadata: await ProductService.publishProductByShop( {
                product_id: req.params.id,
                product_shop: req.user.userId,
            })
        }).send(res)
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'unPublish Product success',
            metadata: await ProductService.unPublishProductByShop( {
                product_id: req.params.id,
                product_shop: req.user.userId,
            })
        }).send(res)
    }
    //QUERY
    /**
     * @description Get all Draft for Shop
     * @param {Number} limit
     * @param res
     * @param next
     * @returns {JSON}
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Draft success',
            metadata: await ProductService.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list getPublishForShop success',
            metadata: await ProductService.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list getAllPublishForShop success',
            metadata: await ProductService.getListSearchProducts(req.params.keySearch)
        }).send(res)
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list products success',
            metadata: await ProductService.findAllProducts(req.query)
        }).send(res)
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list products success',
            metadata: await ProductService.findAllProducts({product_id: req.params.product_id})
        }).send(res)
    }
    //END QUERY
}

module.exports = new ProductController()