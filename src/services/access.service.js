'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const  crypto =require('crypto')
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

const keyTokenService = require('../services/keyToken.service')
const {createTokenPair} = require("../auth/authUtils");
const {getInfoData} = require("../utils");


class AccessService{

    static  signUp = async ({name, email, password}) => {
        try{
            // step1: check mail exists ??
            const holderShop = await shopModel.findOne({ email}).lean();
            if (holderShop){
                return {
                    code :'xxxx',
                    message: 'Shop already registered',

                }
            }

            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if (newShop){
                // created privateKey, publicKey
                // const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })

                const privateKey = crypto.getRandomValues(64).toString('hex');
                const publicKey = crypto.getRandomValues(64).toString('hex');

                console.log(privateKey, publicKey)

                const publicKeyString = await keyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if (!publicKeyString) {
                    return {
                        code: 'xxxx',
                        message: 'publicKeyString error'
                    }
                }

                const publicKeyObject = crypto.createPublicKey(publicKeyString);
                console.log('PublicKeyObject', publicKeyObject);
                //create token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyString, privateKey)
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
        catch (error){
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService