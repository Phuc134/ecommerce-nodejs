'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const  crypto =require('node:crypto')
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

const keyTokenService = require('../services/keyToken.service')
const {createTokenPair, verifyJWT} = require("../auth/authUtils");
const {getInfoData} = require("../utils");
const {BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError} = require("../core/error.response");
const {findByEmail} = require("./shop.service");

class AccessService{
    /*
        check refresh token used
    */
    static handleRefreshToken = async (refreshToken) => {
        console.log('Day la refresh Token', refreshToken);
        const foundToken = await keyTokenService.findByRefreshTokenUsed(refreshToken);
        if (foundToken){
            //decode
            const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey);
            //xoa tat ca token trong keyStore
            await keyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Some thing wrong happened !! Pls login')
        }
        //No
        const holderToken = await keyTokenService.findByRefeshToken(refreshToken);
        if (!holderToken) throw new AuthFailureError(`Shop not registered 1`);
        //verify Token
        const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey);
        //check UserId
        const foundShop = await findByEmail({email});
        if (!foundShop) throw new AuthFailureError('Shop not registered 2');
        //create 1 pair
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey);
        //update Token
        console.log('day la token moi: ',tokens);
        await  holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        });
        console.log('//------',userId, email);
        return {
            user: {userId, email},
            tokens
        }

    }
    /*
        1 - check email
        2 - match password
        3 - create Access Token
        4 - generate Token
        5 - get Data return login
    */
    static login = async ({email, password, refreshToken = null}) => {

        //1
        const foundShop = await findByEmail({email});
        if (!foundShop) throw new BadRequestError('Shop not registered');
        console.log(foundShop);
        console.log(password);
        //2
        const match = bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError('Authentication error');
        //3
        // created privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        //4 generate token
        const tokens = await createTokenPair({userId: foundShop._id, email}, publicKey, privateKey);
        console.log(tokens);
        await keyTokenService.createKeyToken({
            userId: foundShop._id,
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,

        })
        return {
            shop: getInfoData({fields: ['_id', 'name', 'email'], object: foundShop}),
            tokens
        }
    }
    static signUp = async ({name, email, password}) => {

            // step1: check mail exists ??
            const holderShop = await shopModel.findOne({ email}).lean();
            if (holderShop){
                throw new BadRequestError('Error: Shop already registered');

            }

            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if (newShop){

                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                console.log(privateKey, publicKey)

                const keyStore = await keyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if (!keyStore) {
                    return {
                        code: 'xxxx',
                        message: 'keyStore error'
                    }
                }

                //create token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                console.log(`Created Token Success: `, tokens)

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
                //const tokens = await
            }

            return {
                code: 200,
                metadata: null
            }

    }
    static logout = async (keyStore) => {
        return  (await keyTokenService.removeKeyById(keyStore._id));

    }

}

module.exports = AccessService