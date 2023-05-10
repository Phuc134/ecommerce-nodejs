'use strict'
const  mongoose = require('mongoose');

const connectString = `mongodb+srv://hoangphuc22510:phuc123456@cluster0.exz4ftf.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(connectString)
    .then(_ => console.log(`Connected MongoDB Success`))
    .catch(err => console.log(`Error Connect`))

//dev
if (1===0) {
    mongoose.set('debug', true)
    mongoose.set('debug', {color: true})
}

module.exports = mongoose
