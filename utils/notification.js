"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsReadSocket = exports.createNotificationAll = exports.createNotification = void 0;
const notification_model_1 = require("../models/notification.model");
// import { io } from "../config/io_connection";
const index_1 = require("../index");
const user_model_1 = require("../models/user.model");
const ApiError_1 = __importDefault(require("./ApiError"));
const http_status_codes_1 = require("http-status-codes");
const status_enum_1 = require("../interfaces/status/status.enum");
const createNotification = async (title, message, sender, receiver) => {
    try {
        let notification = {};
        const receivers = receiver.split(",");
        for (const receiver of receivers) {
            notification = await notification_model_1.Notification.create({
                title,
                message,
                sender,
                receiver: receiver.toString(),
            });
            index_1.io.emit(receiver.toString(), notification);
        }
        notification = {
            title,
            message,
            sender,
            receiver,
        };
        return notification; // Continue to the next middleware or route
    }
    catch (error) {
        return -1; // Pass any errors to the error-handling middleware
    }
};
exports.createNotification = createNotification;
const createNotificationAll = async (title, message, sender, role) => {
    try {
        const users = await user_model_1.User.find({ role: role });
        // Access the WebSocket server from the request object
        // Create notifications for each user and emit to WebSocket
        let notification = {};
        for (const user of users) {
            notification = await notification_model_1.Notification.create({
                title,
                message,
                sender,
                receiver: user._id.toString(),
            });
            index_1.io.emit(user._id.toString(), notification);
        }
        notification = {
            title,
            message,
            sender,
            reciever: "all",
        };
        return notification; // Continue to the next middleware or route
    }
    catch (error) {
        return -1; // Pass any errors to the error-handling middleware
    }
};
exports.createNotificationAll = createNotificationAll;
const markNotificationAsReadSocket = async (Id) => {
    // Update the notification by its ID to set 'read' to true
    const notification = await notification_model_1.Notification.findByIdAndUpdate(Id, { read: true }, { new: true });
    // 3- check if document not found
    if (!notification) {
        return new ApiError_1.default({
            en: `Not Found Any Result For This Id ${Id}`,
            ar: `${Id}لا يوجداي نتيجة لهذا`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    index_1.io.emit("updateNotification", notification);
    return {
        status: status_enum_1.Status.SUCCESS,
        data: notification,
        message: "Notification marked as read",
        success_en: "updated successfully",
        success_ar: "تم التعديل بنجاح",
    };
};
exports.markNotificationAsReadSocket = markNotificationAsReadSocket;
