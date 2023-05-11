'use strict'

const accessService = require('../services/access.service')
const {CREATED} = require("../core/success.response");

class AccessController{
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

module.exports  =new AccessController();