'use strict'

const keyTokenModel = require('../models/keytoken.model')
const {Schema, Types} =require('mongoose')
class KeyTokenService{

    static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
        try{
            const filter = {user: userId};
            const update = {
                publicKey,
                privateKey,
                refreshTokensUsed: [],
                refreshToken
                };
            const options={upsert: true, new: true}
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);
            return tokens ? tokens.publicKey : null;
        }
        catch (error){
            return  error
        }
    }
    static removeKeyById = async (id) => {
        const test=await keyTokenModel.deleteOne(id);
        console.log(test);
        return test;
    }
    static findByUserId = async (userId) => {
        console.log(userId);
        return (keyTokenModel.findOne({user: userId}));
    }
    static findByRefreshTokenUsed = async (refreshToken) => {
        return keyTokenModel.findOne({refreshTokensUsed: {$in: [refreshToken]}});
    }
    static findByRefeshToken = async (refreshToken) => {
        return ( keyTokenModel.findOne({refreshToken: refreshToken}));
    }
    static deleteKeyById =  async (userId) => {
        return ( keyTokenModel.deleteOne({user: userId}))
    }
}

module.exports = KeyTokenService