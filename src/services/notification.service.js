'use strict'
const NOTI = require('../models/notification.model')

class NotificationService {
    static async pushNotiToSystem(type = 'SHOP-001', receivedId = 1, senderId = 1, options = {}) {
        let noti_content = "";
        if (type == 'SHOP-001') {
            noti_content = "vua moi them 1 san pham @@@"
        } else if (type == 'PROMOTION-001') {
            noti_content = "vua moi them 1 voucher @@@"
        }
        const newNoti = await NOTI.create({
            noti_type: type,
            noti_content,
            noti_senderId: senderId,
            noti_receivedId: receivedId,
            noti_options: options
        })
    }
}

module.exports = NotificationService;