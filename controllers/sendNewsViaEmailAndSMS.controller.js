"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewsViaSMS = exports.sendNewsViaEmail = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const user_model_1 = require("../models/user.model");
const sendEmail_1 = require("../utils/sendEmail");
const sendSMSTaqnyat_1 = require("../utils/sendSMSTaqnyat");
const status_enum_1 = require("../interfaces/status/status.enum");
//@desc Send news via email
//@route POST /api/v1/sendNews/viaEmail
//@access Private (Admin)
exports.sendNewsViaEmail = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { email, message, subject, subSubject } = req.body;
    const body = `
    subSubject: ${subSubject}
    
    message: ${message}
  `;
    if (email.length === 0) {
        // If no email is provided, send news to all users with role "user"
        const users = (await user_model_1.User.find({
            role: "user",
            registrationType: "email",
        }));
        if (users.length === 0) {
            return next(new ApiError_1.default({
                en: "No users registered with email",
                ar: "لا يوجد مستخدمين مسجلين بالبريد الالكترون",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        // Use Promise.all to parallelize the email sending process
        await Promise.all(users.map(async (user) => {
            if (user.email) {
                try {
                    await (0, sendEmail_1.sendEmail)({
                        email: user.email,
                        subject,
                        message: body,
                    });
                }
                catch (err) {
                    console.log(err);
                }
            }
        }));
    }
    else {
        // If no phone number is provided, send news to all users with role "user"
        const users = (await user_model_1.User.find({
            role: "user",
            registrationType: "email",
            email: email,
        }));
        if (!users) {
            return next(new ApiError_1.default({
                en: "No users registered with email",
                ar: "لا يوجد مستخدمين مسجلين بالبريد الالكترون",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        // Send news to the specified email
        await (0, sendEmail_1.sendEmail)({ email, subject, message: body });
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "News sent successfully",
        success_ar: "تم ارسال الاخبار بنجاح",
    });
});
//@desc Send news via SMS
//@route POST /api/v1/sendNews/viaSMS
//@access Private (Admin)
exports.sendNewsViaSMS = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { phone, message } = req.body;
    if (phone.length === 0) {
        // If no phone number is provided, send news to all users with role "user"
        const users = (await user_model_1.User.find({
            role: "user",
            registrationType: "phone",
        }));
        if (users.length === 0) {
            return next(new ApiError_1.default({
                en: "No users registered with phone number",
                ar: "لا يوجد مستخدمين مسجلين برقم الهاتف",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        // Use Promise.all to parallelize the SMS sending process
        await Promise.all(users.map(async (user) => {
            if (user.phone) {
                try {
                    await (0, sendSMSTaqnyat_1.sendSMSTaqnyat)({
                        recipient: parseInt(user.phone),
                        code: message,
                    });
                }
                catch (err) {
                    console.log(err);
                }
            }
        }));
    }
    else {
        // Send news to the specified phone number
        // If no phone number is provided, send news to all users with role "user"
        const users = (await user_model_1.User.find({
            role: "user",
            registrationType: "phone",
            phone: phone,
        }));
        if (!users) {
            return next(new ApiError_1.default({
                en: "No users registered with phone number",
                ar: "لا يوجد مستخدمين مسجلين برقم الهاتف",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        await (0, sendSMSTaqnyat_1.sendSMSTaqnyat)({ recipient: parseInt(phone), code: message });
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "News sent successfully",
        success_ar: "تم ارسال الاخبار بنجاح",
    });
});
