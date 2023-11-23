'use strict'

const DiscountService = require('../services/discount.service');
const {SuccessResponse} = require("../core/success.response");

class DiscountController {
    createDiscount = async (req, res) => {
        new SuccessResponse({
            message: 'Create Success',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllDiscountCodes = async (req, res) => {
        new SuccessResponse({
            message: 'Get All Success',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Su',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        })
    }

    getAllDiscountCodesWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'aaa',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query
            })
        })
    }
}

module.exports = new DiscountController()