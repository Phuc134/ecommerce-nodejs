'use strict'
const {model, Schema} = require('mongoose')

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'Notifications';
//ORDER-001: order success
//ORDER-002: order fail
//PROMOTION-001: new PROMOTION
//SHOP-001: new product by User following

//ban nhan duoc mot voucher cua shop ABC
const notificationSchema = new Schema({
    noti_typ: {type: String, enum: ['ORDER-001', 'ORDER-002', 'PROMOTION-001', 'SHOP-001']},
    noti_senderId: {type: Number, required: true},
    noti_receivedId: {type: Number, required: true},
    noti_content: {type: String, default: ''},
    noti_options: {type: Object, default: {}}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, notificationSchema);
