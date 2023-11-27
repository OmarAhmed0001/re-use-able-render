"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllNotificationsByUser = exports.getUnreadNotificationsByUser = exports.markNotificationAsRead = exports.createNotificationAll = exports.deleteNotification = exports.updateNotification = exports.createNotification = exports.getNotification = exports.getAllNotifications = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const status_enum_1 = require("../interfaces/status/status.enum");
// Utils Imports
const ApiFeatures_1 = require("../utils/ApiFeatures");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const notification_1 = require("../utils/notification");
// Models Imports
const notification_model_1 = require("../models/notification.model");
// Factory Imports
const factory_controller_1 = require("./factory.controller");
// @desc     Get All Notifications
// @route    GET /api/v1/notifications
// @access   Private
exports.getAllNotifications = (0, factory_controller_1.getAllItems)(notification_model_1.Notification);
// @desc     Get Notification By Id
// @route    GET /api/v1/notifications/:id
// @access   Private
exports.getNotification = (0, factory_controller_1.getOneItemById)(notification_model_1.Notification);
// @desc     Create New Notification
// @route    POST /api/v1/notifications
// @access   Private
exports.createNotification = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const { title, message, receiver } = req.body;
    const sender = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // add type guard to check if req.user exists
    const notification = await (0, notification_1.createNotification)(title, message, sender.toString(), receiver);
    // Broadcast the notification to all connected clients
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: notification,
        success_en: "created successfully",
        success_ar: "تم الانشاء بنجاح",
    });
});
// @desc     Update Notification By Id
// @route    PUT /api/v1/notifications/:id
// @access   Private
exports.updateNotification = (0, factory_controller_1.updateOneItemById)(notification_model_1.Notification);
// @desc     Delete Notification
// @route    DELETE /api/v1/notifications/:id
// @access   Private
exports.deleteNotification = (0, factory_controller_1.deleteOneItemById)(notification_model_1.Notification);
// @desc     Create Notification  For All Users
// @route    POST /api/v1/notifications/all
// @access   Private
exports.createNotificationAll = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const { title, message, role } = req.body;
    const sender = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // add type guard to check if req.user exists
    // Broadcast the notification to all connected clients
    //io.emit(receiver, notification);
    const notification = await (0, notification_1.createNotificationAll)(title, message, sender.toString(), role);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: notification,
        success_en: "created successfully",
        success_ar: "تم الانشاء بنجاح",
    });
});
// @desc     Mark Notification As Read
// @route    PUT /api/v1/notifications/read/:id
// @access   Private
exports.markNotificationAsRead = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    // Update the notification by its ID to set 'read' to true
    const notification = await notification_model_1.Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    // 3- check if document not found
    if (!notification) {
        return next(new ApiError_1.default({
            en: `Not Found Any Result For This Id ${id}`,
            ar: `${id}لا يوجداي نتيجة لهذا`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: notification,
        message: "Notification marked as read",
        success_en: "updated successfully",
        success_ar: "تم التعديل بنجاح",
    });
});
// @desc     Get Unread Notifications By User
// @route    GET /api/v1/notifications/unread
// @access   Private
exports.getUnreadNotificationsByUser = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    // Create an instance of ApiFeatures
    const { data, paginationResult } = await new ApiFeatures_1.ApiFeatures(notification_model_1.Notification.find({ read: false, receiver: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }), req.query)
        .filter()
        .search()
        .sort()
        .limitFields()
        .populate()
        .paginate();
    // Return the paginated result
    // 3- get features
    if (data.length === 0) {
        return next(new ApiError_1.default({
            en: "not found",
            ar: "لا يوجد اي نتيجة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        results: data.length,
        paginationResult,
        data,
        success_en: "found successfully",
        success_ar: "تم العثور بنجاح",
    });
});
// @desc     Get All Notifications By User
// @route    GET /api/v1/notifications/all
// @access   Private
exports.getAllNotificationsByUser = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    // Create an instance of ApiFeatures
    const { data, paginationResult } = await new ApiFeatures_1.ApiFeatures(notification_model_1.Notification.find({ receiver: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }), req.query)
        .filter()
        .search()
        .sort()
        .limitFields()
        .populate()
        .paginate();
    // Return the paginated result
    // 3- get features
    if (data.length === 0) {
        return next(new ApiError_1.default({
            en: "not found",
            ar: "لا يوجد اي نتيجة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        results: data.length,
        paginationResult,
        data,
        success_en: "found successfully",
        success_ar: "تم العثور بنجاح",
    });
});
