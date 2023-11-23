'use strict'
const redis = require('redis');
const {promisify} = require('util');
const {reservationInventory} = require("../models/repositories/inventory.repo");
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.pExpire).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`;
    const retryTime = 10;
    const expireTime = 3000; //3 second tam lock

    for (let index = 0; index < retryTime.length; i++) {
        const result = await setnxAsync(key, expireTime);
        console.log(`result:::`, result);
        if (result == 1) {
            const isReversation = await reservationInventory({productId, quantity, cartId});
            if (isReversation.modifiedCount) {
                await pexpire(key, expireTime);
                return key;
            }
            return null;
            //thao tac inventory
            return key;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

}

const releaseLock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient);
    return await delAsyncKey(keyLock);
}

module.exports = {
    acquireLock,
    releaseLock
}