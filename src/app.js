require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');
const app = express();


//init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended: true}))
//init db
require('./dbs/init.mongodb')
const {checkOverload} = require('./helpers/check.connect');
//checkOverload();
//init routes
app.get('/', (req, res, next) => {
    const strCompression = 'Hello';
    return res.status(200).json({
        message: 'Welcome',
        //metadata: strCompression.repeat(10000)
    })
})

app.use(require('./routes/index'))
//handling error

app.use((req, res, next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res,next) => {
    const status = error.status || 500;
    return res.status(status).json({
        status: 'error',
        code: error.status,
        message: error.message || 'Internal Sever Error'
    })
})



module.exports = app;