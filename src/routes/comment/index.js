'use strict'

const express = require('express')
const router = express.Router();
const commentController = require('../../controllers/comment..controller')
const {asyncHandler} = require('../../helpers/asyncHandler')
const {authentication} = require("../../auth/authUtils");

// authentication
router.use(authentication);
router.post('/', asyncHandler(commentController.createComment));


module.exports = router;