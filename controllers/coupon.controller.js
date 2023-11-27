"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCouponByNameAndProducts = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getOneCouponById = exports.getAllCoupons = void 0;
const factory_controller_1 = require("./factory.controller");
const coupon_model_1 = require("../models/coupon.model");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const product_model_1 = require("../models/product.model");
// @desc    Get All Coupons
// @route   Get /api/v1/coupons
// @access  Private (Admin)
exports.getAllCoupons = (0, factory_controller_1.getAllItems)(coupon_model_1.Coupon);
// @desc    Get Specific Coupon By Id
// @route   Get /api/v1/coupons/:id
// @access  Private (Admin)
exports.getOneCouponById = (0, factory_controller_1.getOneItemById)(coupon_model_1.Coupon);
// @desc    Add New Coupon
// @route   POST /api/v1/coupons
// @access  Private (Admin)
exports.createCoupon = (0, factory_controller_1.createNewItem)(coupon_model_1.Coupon);
// @desc    Update Specific Coupon By Id
// @route   PUT /api/v1/coupons/:id
// @access  Private (Admin)
exports.updateCoupon = (0, factory_controller_1.updateOneItemById)(coupon_model_1.Coupon);
// @desc    Delete Specific Coupon By Id
// @route   DELETE /api/v1/coupons/:id
// @access  Private (Admin)
exports.deleteCoupon = (0, factory_controller_1.deleteOneItemById)(coupon_model_1.Coupon);
// @desc    Get Specific Coupon By Name And Specific Products
// @route   Get /api/v1/coupons/ByNameAndProducts
// @access  Private (Admin)
exports.getCouponByNameAndProducts = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get coupon name from req.query
    const couponCode = req.params.code;
    // 2- find coupon by name
    const coupon = await coupon_model_1.Coupon.findOne({ code: couponCode });
    if (!coupon) {
        return next(new ApiError_1.default({
            en: "Coupon Not Found",
            ar: "الكوبون غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const date = new Date();
    if (coupon.type === "normal") {
        // 3- check if coupon is valid date
        if ((coupon.endDate < date || coupon.startDate > date)) {
            return next(new ApiError_1.default({
                en: "Coupon is Expired",
                ar: "الكوبون منتهي",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        // 4- check if coupon that user used all times
        const userUsedAllTimes = coupon.users.filter((user) => {
            return (user.user.toString() === req.user._id.toString() && user.usedNumber === coupon.limit);
        });
        if (userUsedAllTimes.length > 0) {
            return next(new ApiError_1.default({
                en: "You Used This Coupon All Times",
                ar: "لقد استخدمت هذا الكوبون كل مراته",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
    }
    // 5 - collect all products ids that coupon can be used on
    let productsCoupons = [];
    switch (coupon.discountDepartment.key) {
        case "allProducts":
            productsCoupons = await product_model_1.Product.find({});
            break;
        case "products":
            productsCoupons = coupon === null || coupon === void 0 ? void 0 : coupon.discountDepartment.value;
            break;
        case "categories":
            productsCoupons = await product_model_1.Product.find({
                category: [...coupon.discountDepartment.value],
            });
            break;
        case "subcategories":
            productsCoupons = await product_model_1.Product.find({
                subcategory: [...coupon.discountDepartment.value],
            });
            break;
        default:
            break;
    }
    const productsCouponsIds = productsCoupons.map((product) => {
        return product._id.toString();
    });
    // 6- response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        data: {
            discount: coupon.discount,
            productsCouponsIds,
        },
    });
});
