'use strict'

const accessService = require('../services/access.service')
const {CREATED, SuccessResponse} = require("../core/success.response");

class AccessController{
    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await accessService.login(req.body)
        }).send(res)
    }
    signUp = async (req, res, next) => {
         new CREATED({
            message: 'Registered OKE',
            metadata: await accessService.signUp(req.body),
             options: {
                limit: 10
             }
        }).send(res)
    }

}

module.exports  = new AccessController();