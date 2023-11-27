"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountingPage = void 0;
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiFeatures_1 = require("../utils/ApiFeatures");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const status_enum_1 = require("../interfaces/status/status.enum");
const http_status_codes_1 = require("http-status-codes");
const order_model_1 = require("../models/order.model");
// @desc     Get Accounting Page
// @route    PUT/api/v1/accounting
// @access   Private (Admins) TODO: add the rest of the roles
exports.getAccountingPage = (0, express_async_handler_1.default)(async (req, res, next) => {
    const numberDeliveryCompany = 1;
    // const totalOrders = await Order.countDocuments({
    //   status: { $ne: "initiated" },
    //   sendToDelivery: true,
    // });
    const query = req.query;
    const mongoQuery = order_model_1.Order.find({
        status: { $ne: "initiated" },
        sendToDelivery: true,
    });
    const { data: orders, paginationResult } = await new ApiFeatures_1.ApiFeatures(mongoQuery, query)
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();
    if (orders.length === 0) {
        return next(new ApiError_1.default({
            en: "No orders found",
            ar: "لا يوجد طلبات",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const total = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalCashItems = orders.filter((order) => order.paymentType === "cash");
    const totalCash = totalCashItems.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalOnlineItems = orders.filter((order) => order.paymentType === "online");
    const totalOnline = totalOnlineItems.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalBothItems = orders.filter((order) => order.paymentType === "both");
    const totalCashBoth = totalBothItems.reduce((acc, order) => acc + order.cashItems.totalPrice, 0);
    const totalOnlineBoth = totalBothItems.reduce((acc, order) => acc + order.onlineItems.totalPrice, 0);
    const logexHave = totalCashBoth + totalCash;
    const storeHave = totalOnlineBoth + totalOnline;
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        length: orders.length,
        paginationResult,
        data: {
            numberDeliveryCompany,
            totalOrders: orders.length,
            totalOrderSendToDelivery: orders.length,
            numberOfCashOrders: totalCashItems.length,
            numberOfOnlineOrders: totalOnlineItems.length,
            numberOfBothOrders: totalBothItems.length,
            totalMoney: total,
            totalCash: logexHave,
            totalOnline: storeHave,
            orders,
        },
        success_en: "Accounting data retrieved successfully",
        success_ar: "تم استرجاع بيانات المحاسبة بنجاح",
    });
});
