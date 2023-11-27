"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeRate = exports.ExchangeRate = void 0;
const factory_controller_1 = require("./factory.controller");
const changeCurrency_model_1 = __importDefault(require("../models/changeCurrency.model"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
//import IChangeCurrency from '../interfaces/changeCurrency/changeCurrency.interface';
// @desc     Update Exchange Rate
// @route    Post/api/v1/changeCurrency
// @access   Private (Admins)
exports.ExchangeRate = (0, express_async_handler_1.default)(async (req, res) => {
    const { baseCurrency } = req.body;
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, {
        headers: {
            'X-Api-Key': '155ed066805b89ec2dcb286c',
        },
    });
    const data = await response.json();
    const exchangeRates = data.rates;
    await changeCurrency_model_1.default.deleteMany({}).exec();
    // Save the exchange rate data to the database
    const newExchangeRate = new changeCurrency_model_1.default({
        baseCurrency,
        rates: exchangeRates,
    });
    await newExchangeRate.save();
    console.log('Exchange rates saved to the database');
    res.status(200).json({
        message: 'Exchange rates saved successfully', newExchangeRate
    });
});
// @desc     Get Exchange Rate
// @route    Get/api/v1/changeCurrency
// @access   Private (Admins)
exports.getExchangeRate = (0, factory_controller_1.getAllItems)(changeCurrency_model_1.default);
