'use strict'
/*
    Discount service
    1 - generate Discount Code (shop | Admin)
    2 - Get discount amount (User)
    3 - Get all discount codes (User | Shop)
    4 - Verify discount code (user)
    5 - Delete discount code (admin | Shop)
    6 - Cancel discount code (user)
 */

const { BadRequestError, NotFoundError } = require('../core/error.response')
const { discount } = require("../models/discount.model");
const { convertToObjectIdMongoDb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
    findAllDiscountCodeUnselect,
    checkDiscountExists,
    updateDiscount
} = require("../models/repositories/discount.repo");
const { Schema } = require("mongoose");

class DiscountService {
    static async createDiscountCode(payload) {
        console.log('Payload ', payload)

        const {
            code, start_date, end_date, is_active, shopId,
            min_order_value, product_ids, applies_to, name,
            description, type, value, max_value, max_uses, uses_count,
            max_uses_per_user, users_used
        } = payload
        //kiem tra
        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start Date must be before end_date')
        }

        //create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: shopId
        }).lean();

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount exist')
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to == 'all' ? [] : product_ids
        })
        return newDiscount;
    }

    static async updateDiscountCode(discountId, payload) {
        return (await updateDiscount(discountId, payload));
    }

    /*
        Get all discount codes available
     */
    static async getAllDiscountCodesWithProduct({ code, shopId, userId, limit, page }) {
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        }).lean();

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw NotFoundError('discount not exist');
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;
        let products;
        if (discount_applies_to == 'all') {
            //get all products
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongoDb(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if (discount_applies_to == 'specific') {
            //get the products ids
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        return products
    }

    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodeUnselect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: shopId,
                discount_is_active: true,
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        });
        return discounts
    }

    /* Apply discount code */
    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDb(shopId)
            }
        })

        if (!foundDiscount) throw new NotFoundError('Discount not exists ');

        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_max_user_per_user,
            discount_users_used,
            discount_value
        } = foundDiscount

        if (!discount_is_active) throw new NotFoundError('Discount expired')
        if (discount_max_uses) throw new NotFoundError('discount are out')

        if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
            throw new NotFoundError(`discount code has expired`)
        }

        //check xem co gia tri toi thieu hay khong
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            //get total
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`discount require a minimum order value of ${discount_min_order_value}`)
            }
        }

        if (discount_max_user_per_user > 0) {
            const userUserDiscount = discount_users_used.find(user => user.userId == userId);
            if (userUserDiscount) {
                throw BadRequestError(`User used this discount`);
            }
        }

        // check discount is fix amount or percentage
        const amount = discount_type == 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)
        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        })
        return deleted
    }

    /*
        Cancel discount Code
    */
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDb(shopId)
            }
        })

        if (!foundDiscount) throw new NotFoundError(`discount don't exist`);

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })

        return result

    }
}

module.exports = DiscountService