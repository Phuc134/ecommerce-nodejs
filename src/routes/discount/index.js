'use strict'

const express = require('express');
const {asyncHandler} = require("../../helpers/asyncHandler");
const router = express.Router();
const discountController = require('../../controllers/discount.controller')
const {authentication} = require("../../auth/authUtils");
//get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount));
router.get('/list_product_code', asyncHandler(discountController.getAllDiscountCodesWithProduct));

//auth
router.use(authentication)

router.post('/', asyncHandler(discountController.createDiscount));
router.get('/', asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;