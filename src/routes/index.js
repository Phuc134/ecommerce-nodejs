'use strict'

const express = require('express');
const {apiKey, permission} = require("../auth/checkAuth");
const router = express.Router();

//check apiKey
router.use(apiKey)
//check permission
router.use(permission('0000'))

router.use('/v1/api/checkout', require('./checkout/index'))
router.use('/v1/api/product', require('./product/index'))
router.use('/v1/api/discount', require('./discount/index'))
router.use('/v1/api/inventory', require('./inventory'))
router.use('/v1/api/cart', require('./cart/index'))
router.use('/v1/api', require('./access/index'))

router.get('/', (req, res, next) => {
    return res.status(200).json({
        message: 'Welcome'
    })
})

module.exports = router;