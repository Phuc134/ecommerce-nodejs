'use strict'

const {getSelectData, unGetSelectData} = require('../../utils')
const {discount} = require("../discount.model");
const findAllDiscountCodeUnselect = async ({limit = 50, page = 1, sort = 'ctime', filter, unSelect, model}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort == 'ctime' ? {_id: -1} : {_id: 1}
    const documents = await model.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(unGetSelectData(unSelect))
        .lean()
    return documents
}

const findAllDiscountCodeSelect = async ({limit = 50, page = 1, sort = 'ctime', filter, select, model}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort == 'ctime' ? {_id: -1} : {_id: 1}
    const documents = await model.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean()
    return documents
}

const checkDiscountExists = async (model, filter) => {
    const foundDiscount = await model.findOne(filter).lean();
    return foundDiscount;
}

const updateDiscount = async (discountId, payload, isNew = true) => {
    return (await discount.findByIdAndUpdate(discountId, payload, {new: isNew}));

}
module.exports = {
    findAllDiscountCodeUnselect,
    findAllDiscountCodeSelect,
    checkDiscountExists,
    updateDiscount
}