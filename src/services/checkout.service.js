'use strict'

const {BadRequestError} = require("../core/error.response")
const {order} = require("../models/order.model")
const {findCartById} = require("../models/repositories/cart.repo")
const {checkProductByServer} = require("../models/repositories/product.repo")
const {getDiscountAmount} = require("./discount.service")
const {acquireLock, releaseLock} = require("./redis.service")

class CheckoutService {
    // login and without login
    static async checkoutReview({
                                    cartId, userId, shop_order_ids = []
                                }) {
        // check cartId
        const foundCart = await findCartById(cartId)
        if (!foundCart) throw new BadRequestError('Cart does not exist!')

        const checkout_order = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0
        }, shop_order_ids_new = []

        //
        for (let i = 0; i < shop_order_ids.length; i++) {
            const {shopId, shop_discounts = [], item_products = []} = shop_order_ids[i]
            // check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log(`checkProductByServer::: `, checkProductServer)
            if (!checkProductServer[0]) throw new BadRequestError('order wrong!!!')
            // Total price
            const checkoutPrice = await checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)
            // Total price pre-handle
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceAppliedDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            // Nếu shop_discounts tồn tại > 0, check xem có hợp lệ hay ko
            if (shop_discounts.length > 0) {
                // assume only 1 discount
                // get discount amount
                const {totalPrice = 0, discount = 0} = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                // Total discount amount
                checkout_order.totalDiscount += discount

                if (discount > 0) {
                    itemCheckout.priceAppliedDiscount = checkoutPrice - discount
                }
            }
            // Total final checkout price
            checkout_order.totalCheckout += itemCheckout.priceAppliedDiscount
            shop_order_ids_new.push(itemCheckout)
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }

    // order
    static async orderByUser({
                                 shop_order_ids,
                                 cartId,
                                 userId,
                                 user_address = {},
                                 user_payment = {}
                             }) {
        const {shop_order_ids_new, checkout_order} = await CheckoutService.checkoutReview({
            shop_order_ids,
            cartId,
            userId
        })

        // Double check product quantity in inventories
        // get new array of products
        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log(`[1]:: `, products)
        const acquireProducts = []
        for (let i = 0; i < products.length; i++) {
            const {productId, quantity} = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProducts.push(keyLock !== null)
            if (keyLock) {
                await releaseLock(keyLock)
            }
        }
        // if one in products out of stock
        if (acquireProducts.includes(false)) {
            throw new BadRequestError('Please come back to the inventory due to some of products has been updated!')
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        // if insert success: remove product in the cart
        if (newOrder) {

        }
        return newOrder
    }

    /*
        1> Query Orders [users]
    */
    static async getOrdersByUser() {

    }

    /*
        1> Query Orders Using Id [users]
    */
    static async getOneOrderByUser() {

    }

    /*
        1> Cancel Orders [users]
    */
    static async getOrdersByUser() {

    }

    /*
        1> Update Orders Status [Shop | Admin]
    */
    static async updateOrdersStatusByShop() {

    }


}

module.exports = CheckoutService