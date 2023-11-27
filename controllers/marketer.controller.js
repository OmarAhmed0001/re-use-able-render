"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMarketer = exports.updateMarketer = exports.createMarketer = exports.getOneMarketer = exports.getAllMarketers = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const coupon_model_1 = require("../models/coupon.model");
const user_model_1 = require("../models/user.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
// @desc    Get All Marketers
// @route   GET /api/v1/marketers
// @access  Private/Admin
exports.getAllMarketers = (0, express_async_handler_1.default)(async (req, res, next) => {
    const marketers = await user_model_1.User.find({ role: "marketer" }).populate("couponMarketer");
    if (!marketers) {
        return next(new ApiError_1.default({
            en: "Marketers Not Found",
            ar: "المسوقين غير موجودين",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        results: marketers.length,
        data: {
            marketers,
        },
        success_en: "Get All Items Successfully",
        success_ar: "تم الحصول على جميع العناصر بنجاح",
    });
});
// @desc    Get One Marketer By Id
// @route   GET /api/v1/marketers/:id
// @access  Private/Admin
exports.getOneMarketer = (0, express_async_handler_1.default)(async (req, res, next) => {
    const marketer = await user_model_1.User.findOne({
        _id: req.params.id,
        role: "marketer",
    }).populate("couponMarketer");
    if (!marketer) {
        return next(new ApiError_1.default({
            en: "Marketer Not Found",
            ar: "المسوق غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        data: {
            marketer,
        },
        success_en: "Get Item Successfully",
        success_ar: "تم الحصول على العنصر بنجاح",
    });
});
// @desc    Create Marketer
// @route   POST /api/v1/marketers
// @access  Private/Admin
exports.createMarketer = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- check if coupon code is already exist
    const existCoupon = await coupon_model_1.Coupon.findOne({ code: req.body.code });
    if (existCoupon) {
        return next(new ApiError_1.default({
            en: "Coupon Code Already Exist",
            ar: "كود الكوبون موجود بالفعل",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2- check if email or phone is already exist
    const existEmail = await user_model_1.User.findOne({ email: req.body.email });
    if (existEmail) {
        return next(new ApiError_1.default({
            en: "Email Already Used",
            ar: "البريد الالكتروني مستخدم بالفعل",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- check if email or phone is already exist
    const existPhone = await user_model_1.User.findOne({ phone: req.body.phone });
    if (existPhone) {
        return next(new ApiError_1.default({
            en: "Phone Already Used",
            ar: "رقم الهاتف مستخدم بالفعل",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const coupon = await coupon_model_1.Coupon.create({
        type: "marketing",
        code: req.body.code,
        discount: req.body.discount,
        commissionMarketer: req.body.commissionMarketer,
        discountDepartment: req.body.discountDepartment,
    });
    if (!coupon) {
        return next(new ApiError_1.default({
            en: "Coupon Not Created",
            ar: "الكوبون لم يتم انشائه",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // create marketer
    const user = await user_model_1.User.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        role: "marketer",
        couponMarketer: coupon._id,
    });
    if (!user) {
        return next(new ApiError_1.default({
            en: "Marketer Not Created",
            ar: "المسوق لم يتم انشائه",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // send response
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: "success",
        data: {
            user,
            coupon,
        },
        success_en: "created successfully",
        success_ar: "تم الانشاء بنجاح",
    });
});
// @desc    Update Marketer
// @route   PUT /api/v1/marketers/:id
// @access  Private/Admin
exports.updateMarketer = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    // 1- check if marketer is exist
    const marketer = await user_model_1.User.findById(req.params.id);
    if (!marketer) {
        return next(new ApiError_1.default({
            en: "Marketer Not Found",
            ar: "المسوق غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    console.log("marketer :::::::::::: ", marketer);
    // 2- check if coupon is exist
    const coupon = await coupon_model_1.Coupon.findById(marketer.couponMarketer);
    if (!coupon) {
        return next(new ApiError_1.default({
            en: "Coupon Not Found",
            ar: "الكوبون غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- check if coupon code is already exist
    const existCoupon = await coupon_model_1.Coupon.findOne({
        code: req.body.code,
        _id: { $ne: coupon._id },
    });
    if (existCoupon) {
        return next(new ApiError_1.default({
            en: "Coupon Code Already Exist",
            ar: "كود الكوبون موجود بالفعل",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 4- check if email is already exist
    if (req.body.email !== "") {
        const existEmail = await user_model_1.User.findOne({
            email: req.body.email,
            _id: { $ne: marketer._id },
        });
        if (existEmail) {
            return next(new ApiError_1.default({
                en: "Email Already Used",
                ar: "البريد الالكتروني مستخدم بالفعل",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
    }
    // 5- check if phone is already exist
    if (req.body.phone !== "") {
        const existPhone = await user_model_1.User.findOne({
            phone: req.body.phone,
            _id: { $ne: marketer._id },
        });
        if (existPhone) {
            return next(new ApiError_1.default({
                en: "Phone Already Used",
                ar: "رقم الهاتف مستخدم بالفعل",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
    }
    // 6- update marketer
    const user = await user_model_1.User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
    }, { new: true });
    if (!user) {
        return next(new ApiError_1.default({
            en: "Marketer Not Updated",
            ar: "المسوق لم يتم تعديله",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 7- update coupon
    const couponUpdate = await coupon_model_1.Coupon.findByIdAndUpdate({ _id: (_a = marketer.couponMarketer) === null || _a === void 0 ? void 0 : _a.toString() }, {
        code: req.body.code,
        discount: req.body.discount,
        commissionMarketer: req.body.commissionMarketer,
        discountDepartment: req.body.discountDepartment,
    }, { new: true });
    if (!couponUpdate) {
        return next(new ApiError_1.default({
            en: "Coupon Not Updated",
            ar: "الكوبون لم يتم تعديله",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 8- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        data: {
            user,
            // couponUpdate
        },
        success_en: "updated successfully",
        success_ar: "تم التعديل بنجاح",
    });
});
// @desc    Delete Marketer
// @route   DELETE /api/v1/marketers/:id
// @access  Private/Admin
exports.deleteMarketer = (0, express_async_handler_1.default)(async (req, res, next) => {
    const marketer = await user_model_1.User.findById(req.params.id);
    if (!marketer) {
        return next(new ApiError_1.default({
            en: "Marketer Not Found",
            ar: "المسوق غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // delete marketer
    await user_model_1.User.findByIdAndDelete(req.params.id);
    // delete coupon
    await coupon_model_1.Coupon.findByIdAndDelete(marketer.couponMarketer);
    // send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        success_en: "Marketer Deleted Successfully",
        success_ar: "تم حذف المسوق بنجاح",
    });
});
