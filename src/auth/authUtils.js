'use strict'
const HEADER = {
    API_KEY : 'x-api-key',
    AUTHORIZATION : 'authorization',
    CLIENT_ID: 'x-client-id',
    REFRESHTOKEN: 'x-rtoken-id'
}
const JWT = require('jsonwebtoken')
const {asyncHandler} = require("../helpers/asyncHandler");
const {AuthFailureError, NotFoundError} = require("../core/error.response");
const {findByUserId} = require('../services/keyToken.service')
const createTokenPair = async (payload, publicKey, privateKey) => {

        //accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        //
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log(`error verify: `, err)
            }
            else {
                console.log(`decode verify: `, decode)
            }
        })
        return {accessToken, refreshToken}

}

const authentication = asyncHandler(async (req, res, next)=> {
    /*
        1 - check userId missing ?
        2 - get accessToken
        3 - verifyToken
        4 - check user in db?
        5 - check keyStore with this userId
        6 - Ok all => return next
     */
    // 1
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw AuthFailureError('Invalid request');
    // 2
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw NotFoundError('Not found keystore');
    // 3
    if (req.headers[HEADER.REFRESHTOKEN]){
        try{
            const refreshToken = req.headers[HEADER.REFRESHTOKEN];
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
            if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User');
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            next();
        }
        catch (err){
            throw err
        }
    }
    else {
        const accessToken = req.headers[HEADER.AUTHORIZATION]
        if (!accessToken) throw AuthFailureError('Invalid Request');

        try{
            const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
            if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid Userid');
            req.keyStore = keyStore;
            req.user = decodeUser;
            return next();
        }
        catch (err){
            throw  err
        }
    }
})

const verifyJWT = async (token, keySecret) => {
    return (await JWT.verify(token, keySecret));
}
module.exports = {
    createTokenPair,
    authentication,
    verifyJWT
}