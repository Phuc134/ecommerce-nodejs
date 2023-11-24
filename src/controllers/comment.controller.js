'use strict'

const {createComment} = require('../services/comment.service');
const {SuccessResponse} = require("../core/success.response");

class CommentController {
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new comment',
            metadata: await createComment(req.body)
        }).send(res)
    }
}

module.exports = new CommentController();