"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyPasswordResetCode = exports.forgetPassword = exports.createGuestUser = exports.changePassword = exports.verifyCode = exports.login = exports.register = void 0;
const crypto_1 = __importDefault(require("crypto"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const status_enum_1 = require("../interfaces/status/status.enum");
const user_model_1 = require("../models/user.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const sendSMS_1 = require("../utils/sendSMS");
const sendEmail_1 = require("../utils/sendEmail");
const cart_model_1 = require("../models/cart.model");
// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a, _b, _c;
    const { registrationType, email, phone, password, name } = req.body;
    // check if he is guest try to register
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    let userId = null;
    if (token) {
        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // get the user id from the decoded token
            userId = decodedToken._id;
        }
        catch (error) { }
    }
    if (registrationType === "email") {
        const existingUser = await user_model_1.User.findOne({ email });
        if ((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.phone)
            delete req.body.phone;
        if (existingUser) {
            throw new ApiError_1.default({
                en: `User ${email} already exists`,
                ar: `موجود بالفعل ${email} المستخدم`,
            }, http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        const user = await user_model_1.User.create({ registrationType, email, password, name });
        if (userId) {
            await cart_model_1.Cart.updateMany({
                user: userId,
            }, {
                user: user._id,
            });
        }
        const token = user.createToken();
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            status: status_enum_1.Status.SUCCESS,
            success_en: "Registered successfully",
            success_ar: "تم التسجيل بنجاح",
            data: {
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        });
    }
    else if (registrationType === "phone") {
        const existingUser = await user_model_1.User.findOne({ registrationType, phone });
        if ((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.email)
            delete req.body.email;
        if (existingUser) {
            throw new ApiError_1.default({
                en: `User ${phone} already exists`,
                ar: `موجود بالفعل ${phone} المستخدم`,
            }, http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        const user = await user_model_1.User.create({ registrationType, phone, name });
        if (userId) {
            await cart_model_1.Cart.updateMany({
                user: userId,
            }, {
                user: user._id,
            });
        }
        // 2) If user exist, Generate Hash Random Reset Code (6 digits), and save it in dataBase
        // const verifiedCode = Math.floor(
        //   100000 + Math.random() * 900000
        // ).toString();
        const verifiedCode = "123456";
        const hashedResetCode = crypto_1.default
            .createHash("sha256")
            .update(verifiedCode)
            .digest("hex");
        // Save Hashed Password Reset Code Into DataBase
        user.verificationCode = hashedResetCode;
        // Add Expiration Time For Code Reset Password (15 min)
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.passwordResetVerified = false;
        await user.save();
        // 3) send the reset code via email
        // try {
        //   await sendSMSTaqnyat({
        //     recipient: parseInt(req.body.phone),
        //     code: verifiedCode,
        //   });
        // } catch (err) {
        //   user.verificationCode = undefined;
        //   user.passwordResetExpires = undefined;
        //   user.passwordResetVerified = undefined;
        //   await user.save();
        //   return next(
        //     new ApiError(
        //       {
        //         en: "There Is An Error In Sending SMS",
        //         ar: "هناك خطأ في إرسال الرسالة القصيرة",
        //       },
        //       StatusCodes.INTERNAL_SERVER_ERROR
        //     )
        //   );
        // }
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            status: status_enum_1.Status.SUCCESS,
            success_en: "Registered And send code successfully",
            success_ar: "تم التسجيل وارسال الكود بنجاح",
            data: user,
        });
    }
});
// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- take data from request body
    const { registrationType, email, phone } = req.body;
    if (registrationType === "email") {
        const user = await user_model_1.User.findOne({ email: email });
        if (!user) {
            return next(new ApiError_1.default({
                en: `User ${email} not found`,
                ar: `غير موجود ${email} المستخدم`,
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        // 3- check if password is correct
        const isMatch = user.comparePassword(req.body.password);
        console.log(isMatch);
        if (!isMatch) {
            return next(new ApiError_1.default({
                en: `invalid email or password`,
                ar: `بريد إلكتروني أو كلمة مرور غير صالحة`,
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        // 4- create token
        const token = user.createToken();
        // 5- send response
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: status_enum_1.Status.SUCCESS,
            success_en: "logged in successfully",
            success_ar: "تم تسجيل الدخول بنجاح",
            data: {
                email,
                name: user.name || "",
                role: user.role,
            },
            token,
        });
    }
    else if (registrationType === "phone") {
        const user = await user_model_1.User.findOne({ phone: phone });
        if (!user) {
            return next(new ApiError_1.default({
                en: `User ${phone} not found`,
                ar: `غير موجود ${phone} المستخدم`,
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        // 2) If user exist, Generate Hash Random Reset Code (6 digits), and save it in dataBase
        // const verifiedCode = Math.floor(
        //   100000 + Math.random() * 900000
        // ).toString();
        const verifiedCode = "123456";
        const hashedResetCode = crypto_1.default
            .createHash("sha256")
            .update(verifiedCode)
            .digest("hex");
        // Save Hashed Password Reset Code Into DataBase
        user.verificationCode = hashedResetCode;
        // Add Expiration Time For Code Reset Password (15 min)
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.passwordResetVerified = false;
        await user.save();
        // 3) send the reset code via email
        // try {
        //   await sendSMSTaqnyat({
        //     recipient: parseInt(req.body.phone),
        //     code: verifiedCode,
        //   });
        // } catch (err) {
        //   user.verificationCode = undefined;
        //   user.passwordResetExpires = undefined;
        //   user.passwordResetVerified = undefined;
        //   await user.save();
        //   return next(
        //     new ApiError(
        //       {
        //         en: "There Is An Error In Sending SMS",
        //         ar: "هناك خطأ في إرسال الرسالة القصيرة",
        //       },
        //       StatusCodes.INTERNAL_SERVER_ERROR
        //     )
        //   );
        // }
        // 5- send response
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: status_enum_1.Status.SUCCESS,
            success_en: "send code successfully",
            success_ar: "تم ارسال الكود بنجاح",
            data: {
                phone: user === null || user === void 0 ? void 0 : user.phone,
                role: user === null || user === void 0 ? void 0 : user.role,
            },
        });
    }
});
// @desc    Verify Code
// @route   POST /api/v1/auth/verifyCode/
// @access  Public
exports.verifyCode = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { code, phone } = req.body;
    const hashedResetCode = crypto_1.default
        .createHash("sha256")
        .update(code)
        .digest("hex");
    const user = await user_model_1.User.findOne({
        verificationCode: hashedResetCode,
        passwordResetExpires: { $gt: Date.now() },
        passwordResetVerified: false,
        phone: phone
    });
    if (!user) {
        return next(new ApiError_1.default({
            en: "not valid code",
            ar: "كود غير صالح",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    const token = user.createToken();
    user.passwordResetVerified = true;
    await user.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "logged in successfully",
        success_ar: "تم تسجيل الدخول بنجاح",
        data: user,
        token,
    });
});
// @desc    Change password
// @route   POST /api/v1/auth/changePassword
// @access  Public
exports.changePassword = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- take date from request body
    const { oldPassword, newPassword } = req.body;
    // 2- check if user already exit
    const user = await user_model_1.User.findById(req.user._id);
    if (!user) {
        return next(new ApiError_1.default({
            en: `User not found`,
            ar: `المستخدم غير موجود`,
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // 3- check old password is correct
    const isMatch = user.comparePassword(oldPassword);
    if (!isMatch) {
        return next(new ApiError_1.default({
            en: `invalid password`,
            ar: `كلمة مرور غير صالحة`,
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // 4- update password
    user.password = newPassword;
    user.changePasswordAt = new Date();
    await user.save();
    // 5- create token
    const token = user.createToken();
    // 6- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "password updated successfully",
        success_ar: "تم تحديث كلمة المرور بنجاح",
        data: {
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
        },
        token,
    });
});
// @desc    createGuestUser
// @route   POST /api/v1/auth/createGuestUser
// @access  Public
exports.createGuestUser = (0, express_async_handler_1.default)(async (req, res, next) => {
    const randomEmail = Math.random()
        .toString(36)
        .substring(7)
        .concat("_guest@guest.com");
    const user = await user_model_1.User.create({
        name: "guest",
        role: "guest",
        email: randomEmail,
    });
    //   const clientIP =
    //   (req.headers['x-forwarded-for'] as string) || (req.socket.remoteAddress as string);
    //   console.log('Client IP:', clientIP);
    //   const ip =clientIP.split(',')[0];
    //   console.log('Client Public IP:', ip);
    //  const clientIpData = geoip.lookup(ip);
    //  //const clientCountry = getCountryFromIP(clientIP);
    //  if (!clientIpData) {
    //   return next(
    //     new ApiError(
    //       { en: "clientIpData not found", ar: "بلد المستخدم غير موجودة" },
    //       StatusCodes.NOT_FOUND
    //     )
    //   );
    //   }
    //   console.log('Client Ip Data:', clientIpData);
    //   await createAndUpdateVisitorHistory(clientIpData?.country, ip);
    const token = user.createGuestToken();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "Guest Logged in successfully",
        success_ar: "تم تسجيل الدخول كضيف بنجاح",
        token,
    });
});
exports.forgetPassword = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { username } = req.body;
    // 1) Get User By Email
    const user = await user_model_1.User.findOne({
        $or: [{ email: username }, { phone: username }],
    });
    if (!user) {
        return next(new ApiError_1.default({
            en: `There Is No User With That ${req.body.username}`,
            ar: `لا يوجد مستخدم بهذا ${req.body.username}`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2) If user exist, Generate Hash Random Reset Code (6 digits), and save it in dataBase
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto_1.default
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");
    // Save Hashed Password Reset Code Into DataBase
    user.verificationCode = hashedResetCode;
    // Add Expiration Time For Code Reset Password (10 min)
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.passwordResetVerified = false;
    await user.save();
    // 3) send the reset code via email
    const messageBody = `Hi ${user.name.split(" ")[0]},\nVerification Code (${resetCode})`;
    // If Email Else Phone
    let messageResponseArabic = "";
    let messageResponseEnglish = "";
    if (username.includes("@")) {
        // 1) Send Email
        messageResponseEnglish = "Code Send Successfully, Check Your Email";
        messageResponseArabic = "تم إرسال الرمز بنجاح ، تحقق من بريدك الإلكتروني";
        try {
            await (0, sendEmail_1.sendEmail)({
                email: username,
                subject: "Your Code For Reset Password (Valid For 15 min)",
                message: messageBody,
            });
        }
        catch (err) {
            user.verificationCode = undefined;
            user.passwordResetExpires = undefined;
            user.passwordResetVerified = undefined;
            await user.save();
            return next(new ApiError_1.default({
                en: "There Is An Error In Sending Email",
                ar: "هناك خطأ في إرسال البريد الإلكتروني",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
    }
    else {
        // 2) Send SMS
        messageResponseEnglish = "Code Send Successfully, Check Your SMS";
        messageResponseArabic = "تم إرسال الرمز بنجاح ، تحقق من الرسائل القصيرة الخاصة بك";
        const isSMSSend = await (0, sendSMS_1.sendSMS)({
            from: "Reuseable Store",
            to: req.body.phone,
            text: messageBody,
        });
        if (!isSMSSend) {
            user.verificationCode = undefined;
            user.passwordResetExpires = undefined;
            user.passwordResetVerified = undefined;
            await user.save();
            return next(new ApiError_1.default({
                en: "There Is An Error In Sending SMS",
                ar: "هناك خطأ في إرسال الرسالة القصيرة",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: messageResponseEnglish,
        success_ar: messageResponseArabic,
        data: {
            email: user.email,
        },
    });
});
exports.verifyPasswordResetCode = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { resetCode } = req.body;
    // 1) Get User Based On Reset Code
    const hashedResetCode = crypto_1.default
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");
    const user = await user_model_1.User.findOne({
        verificationCode: hashedResetCode,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new ApiError_1.default({
            en: `Invalid Code`,
            ar: `رمز غير صالح`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2) Reset Code Valid
    user.passwordResetVerified = true;
    await user.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "Code Verified Successfully",
        success_ar: "تم التحقق من الرمز بنجاح",
        data: {
            email: user.email,
        },
    });
});
exports.resetPassword = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { username, newPassword } = req.body;
    // 1) Get User Based On Email
    const user = await user_model_1.User.findOne({
        $or: [{ email: username }, { phone: username }],
    });
    if (!user) {
        return next(new ApiError_1.default({
            en: `There Is No User With That ${req.body.username}`,
            ar: `لا يوجد مستخدم بهذا ${req.body.username}`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2) Check If Reset Code Verified
    if (!user.passwordResetVerified) {
        return next(new ApiError_1.default({
            en: "Reset Code Not Verified",
            ar: "لم يتم التحقق من إعادة تعيين الرمز",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    user.password = newPassword;
    user.verificationCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    // 3) Generate Token
    const token = user.createToken();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "Password Reset Successfully",
        success_ar: "تم إعادة تعيين كلمة المرور بنجاح",
        data: username.includes("@")
            ? { email: user.email }
            : { phone: user.phone },
    });
});
