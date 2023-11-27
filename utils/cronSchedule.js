"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExchangeRates = exports.closeAllOffersThatEnded = exports.RemoveAllGuestUsers = exports.closeAllCouponsThatEnded = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const coupon_model_1 = require("../models/coupon.model");
const user_model_1 = require("../models/user.model");
const offer_model_1 = require("../models/offer.model");
const user_interface_1 = require("../interfaces/user/user.interface");
const product_model_1 = require("../models/product.model");
const changeCurrency_model_1 = __importDefault(require("../models/changeCurrency.model"));
// @desc    Get Specific Coupon By Name And Specific Products
exports.closeAllCouponsThatEnded = node_cron_1.default.schedule('5 0 * * *', async () => {
    // 1- get all offers that endDate is today
    const date = new Date();
    // 2- update it to false
    await coupon_model_1.Coupon.updateMany({ endDate: { $lt: date }, active: true }, { active: false });
});
// @ desc    Remove All Guest Users
exports.RemoveAllGuestUsers = node_cron_1.default.schedule('10 0 * * *', async () => {
    const users = await user_model_1.User.find({ role: user_interface_1.Role.Guest });
    if (users.length > 0) {
        users.forEach(async (user) => {
            await user_model_1.User.findByIdAndDelete(user._id);
        });
    }
});
// @ desc    Remove All Offers That Ended
exports.closeAllOffersThatEnded = node_cron_1.default.schedule('0 0 * * *', async () => {
    // 1- get all offers that endDate is today
    const date = new Date();
    const offers = await offer_model_1.Offer.find({ endDate: { $lt: date }, flag: true });
    if (!offers)
        return;
    // 2- update it to false
    await offer_model_1.Offer.updateMany({ endDate: { $lt: date }, flag: true }, { flag: false });
    // 3- get all offers id
    const offersId = offers.map((item) => item._id);
    // 4- using bulkOption to remove all offers from all products
    const products = await product_model_1.Product.find({ offer: { $in: offersId } });
    // 5- update priceAfterDiscount to priceBeforeDiscount
    const bulkOption = products.map((item) => ({
        updateOne: {
            filter: { _id: item._id },
            update: {
                $unset: { offer: "" },
                $set: { priceAfterDiscount: item.priceBeforeDiscount },
            },
        },
    }));
    await product_model_1.Product.bulkWrite(bulkOption, {});
});
// Perform the initial update
exports.updateExchangeRates = node_cron_1.default.schedule('5 0 * * *', async () => {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/SAR', {
            headers: {
                'X-Api-Key': '155ed066805b89ec2dcb286c',
            },
        });
        const data = await response.json();
        const exchangeRates = data.rates;
        changeCurrency_model_1.default.deleteMany({}).exec();
        // Save the updated exchange rate data to the database
        const newExchangeRate = new changeCurrency_model_1.default({
            baseCurrency: 'SAR',
            rates: exchangeRates,
        });
        await newExchangeRate.save();
        console.log('Exchange rates updated and saved to the database');
    }
    catch (error) {
        console.error('Error fetching and saving exchange rates:', error);
    }
});
// Schedule updates every hour (3600000 milliseconds)
// const updateInterval = 3600000;
// // Set up a repeating job using setInterval
// setInterval(() => {
// // Call the updateExchangeRates function
// updateExchangeRates();
// }, updateInterval);
