"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllVisitorsHistory = exports.getOrdersEachMonth = exports.getAllStatusDetails = exports.getOrdersEachDayAndTotalMoney = exports.getGuestUserEachDay = exports.getUserEachDay = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const moment_1 = __importDefault(require("moment"));
const status_enum_1 = require("../interfaces/status/status.enum");
const user_interface_1 = require("../interfaces/user/user.interface");
const order_model_1 = require("../models/order.model");
const user_model_1 = require("../models/user.model");
const visitorHistory_model_1 = require("../models/visitorHistory.model");
// @desc     Get All Users That Signed Up In One Day
// @route    GET/api/v1/history/getUserEachDay
// @access   Private (Admins) TODO: add the rest of the roles
exports.getUserEachDay = (0, express_async_handler_1.default)(async (req, res, next) => {
    const startToday = new Date(new Date().setHours(2, 0, 0, 0));
    const endToday = new Date(new Date().setHours(25, 59, 59, 999));
    const users = await user_model_1.User.find({
        createdAt: {
            $gte: startToday,
            $lt: endToday,
        },
        role: {
            $ne: user_interface_1.Role.Guest,
        },
    }).select("-password");
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        results: users.length,
        data: users,
        success_en: "found successfully",
        success_ar: "تم العثور بنجاح",
    });
});
// @desc     Get All Guest Users That Signed Up In One Day
// @route    GET/api/v1/history/getGuestUserEachDay
// @access   Private (Admins) TODO: add the rest of the roles
exports.getGuestUserEachDay = (0, express_async_handler_1.default)(async (req, res, next) => {
    const startToday = new Date(new Date().setHours(2, 0, 0, 0));
    const endToday = new Date(new Date().setHours(25, 59, 59, 999));
    const users = await user_model_1.User.find({
        createdAt: {
            $gte: startToday,
            $lt: endToday,
        },
        role: user_interface_1.Role.Guest,
    }).select("-password");
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        results: users.length,
        data: users,
        success_en: "found successfully",
        success_ar: "تم العثور بنجاح",
    });
});
// @desc     Get All Orders and Total Money That inside One Day
// @route    GET/api/v1/history/getOrdersEachDayAndTotalMoney
// @access   Private (Admins) TODO: add the rest of the roles
exports.getOrdersEachDayAndTotalMoney = (0, express_async_handler_1.default)(async (req, res, next) => {
    const startToday = new Date(new Date().setHours(2, 0, 0, 0));
    const endToday = new Date(new Date().setHours(25, 59, 59, 999));
    const orders = await order_model_1.Order.find({
        status: {
            $ne: "initiated",
        },
        createdAt: {
            $gte: startToday,
            $lt: endToday,
        },
    });
    const totalMoney = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        results: orders.length,
        totalMoney: totalMoney,
        success_en: "found successfully",
        success_ar: "تم العثور بنجاح",
    });
});
// @desc     Get All Status Details
// @route    GET/api/v1/history/getAllStatusDetails
// @access   Private (Admins) TODO: add the rest of the roles
exports.getAllStatusDetails = (0, express_async_handler_1.default)(async (req, res, next) => {
    const orders = await order_model_1.Order.find({}).select("status");
    const status = orders.map((order) => order.status);
    const statusDetails = {
        initiated: status.filter((s) => s === "initiated").length,
        created: status.filter((s) => s === "created").length,
        onGoing: status.filter((s) => s === "on going").length,
        onDelivered: status.filter((s) => s === "on delivered").length,
        completed: status.filter((s) => s === "completed").length,
        refund: status.filter((s) => s === "refund").length,
    };
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        results: orders.length,
        statusDetails,
        success_en: "found successfully",
        success_ar: "تم العثور بنجاح",
    });
});
// @desc     Get All Orders in Each month
// @route    GET/api/v1/history/getOrdersEachMonth
// @access   Private (Admins) TODO: add the rest of the roles
exports.getOrdersEachMonth = (0, express_async_handler_1.default)(async (req, res, next) => {
    let months = {
        January: 0,
        February: 0,
        March: 0,
        April: 0,
        May: 0,
        June: 0,
        July: 0,
        August: 0,
        September: 0,
        October: 0,
        November: 0,
        December: 0,
    };
    const orders = await order_model_1.Order.find({});
    orders.map((order) => {
        let newDate = new Date(order.createdAt);
        if (Object.keys(months).includes((0, moment_1.default)(newDate.setMonth(newDate.getMonth())).format("MMMM"))) {
            months[`${(0, moment_1.default)(newDate.setMonth(newDate.getMonth())).format("MMMM")}`]++;
        }
    });
    res.status(200).send({
        status: status_enum_1.Status.SUCCESS,
        results: orders.length,
        months,
        success_en: "found successfully",
        success_ar: "تم العثور بنجاح",
    });
});
// @desc    Get All VisitorHistory
// @route   POST /api/v1/visitorHistory
// @access  Private (Admin)
exports.getAllVisitorsHistory = (0, express_async_handler_1.default)(async (req, res, next) => {
    const data = await visitorHistory_model_1.VisitorHistory.find({});
    const transformedData = [
        ['Country', 'Popularity'],
        // Add more countries and their corresponding counts as needed
    ];
    data.forEach((element) => {
        transformedData.push([element.country, element.count]);
    });
    console.log(transformedData);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: 'success',
        data: transformedData,
        success_en: 'found successfully',
        success_ar: 'تم العثور بنجاح',
    });
});
