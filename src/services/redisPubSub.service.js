const Redis = require('redis');

class RedisPubSubService {
    constructor() {
        this.subscribe = Redis.createClient();
        this.publish = Redis.createClient();
    }

    publish(channel, message) {
        return new Promise((resolve, reject) => {
            this.publish(channel, message, (err, reply) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            })
        })
    }

    subscribe(channel, callback) {
        this.subscribe.subscribe(channel);
        this.subscribe.on('message', (subscribeChannel, message) => {
            if (channel == subscribeChannel) {
                callback(channel, message);
            }
        })
    }
}

module.exports = new RedisPubSubService()