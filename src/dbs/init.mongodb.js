'use strict'
const  mongoose = require('mongoose');
const {db: {host, name, port}} = require('../configs/config.mongodb')
const connectString = `mongodb+srv://hoangphuc22510:phuc123456@cluster0.exz4ftf.mongodb.net/?retryWrites=true&w=majority`;

const {countConnect} = require('../helpers/check.connect')
class Database{
    constructor() {
        this.connect();
    }

    //connect
    connect(type = 'mongodb'){
        if (1===1) {
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }
        mongoose.connect(connectString)
            .then(_ => console.log(`Connected MongoDB Success`, countConnect()))
            .catch(err => console.log(`Error Connect`))
    }

    static getInstance(){
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance
    }
}
const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb