"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOffer = exports.updateOffer = exports.createOffer = exports.getOneOfferById = exports.getAllOffers = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const offer_model_1 = require("../models/offer.model");
const http_status_codes_1 = require("http-status-codes");
const status_enum_1 = require("../interfaces/status/status.enum");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const product_model_1 = require("../models/product.model");
const factory_controller_1 = require("./factory.controller");
// @desc    Get All Offers
// @route   Get /api/v1/offers
// @access  Private (User)
exports.getAllOffers = (0, factory_controller_1.getAllItems)(offer_model_1.Offer);
// @desc    Get Specific Offer By Id
// @route   Get /api/v1/offers/:id
// @access  Private (User)
exports.getOneOfferById = (0, factory_controller_1.getOneItemById)(offer_model_1.Offer);
// @desc    Add New Offer
// @route   POST /api/v1/offers
// @access  Private (User)
exports.createOffer = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get data from body
    const { title, percentage, discountDepartment } = req.body;
    // 2- check if offer already exist
    const exist = await offer_model_1.Offer.findOne({ title: title });
    if (exist) {
        return next(new ApiError_1.default({
            en: `this offer already exist`,
            ar: `هذا العرض موجود بالفعل`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- create new offer
    const newOffer = await offer_model_1.Offer.create(req.body);
    // using bulkOption to add this offer to all products
    let data;
    switch (discountDepartment.key) {
        case "products":
            data = await product_model_1.Product.find({
                _id: [...discountDepartment.value],
            });
            break;
        case "categories":
            data = await product_model_1.Product.find({
                category: [...discountDepartment.value],
            });
            break;
        case "subcategory":
            data = await product_model_1.Product.find({
                subcategory: [...discountDepartment.value],
            });
            break;
        default:
            data = await product_model_1.Product.find({});
            break;
    }
    if (discountDepartment.key === "products" ||
        discountDepartment.key === "categories" ||
        discountDepartment.key === "subcategory") {
        const bulkOption = data.map((item) => ({
            updateOne: {
                filter: { _id: item._id },
                update: {
                    $set: {
                        offer: newOffer._id,
                        priceAfterDiscount: item.priceBeforeDiscount -
                            (item.priceBeforeDiscount * percentage) / 100,
                    },
                },
            },
        }));
        await product_model_1.Product.bulkWrite(bulkOption, {});
    }
    // 4- return response
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: newOffer,
        success_en: "created successfully",
        success_ar: "تم الإنشاء بنجاح",
    });
});
// @desc    Update Specific Offer By Id
// @route   PUT /api/v1/offers/:id
// @access  Private (User)
exports.updateOffer = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get data from body
    const { title, percentage, discountDepartment } = req.body;
    // 2- check if offer already exist
    const offer = await offer_model_1.Offer.findById(req.params.id);
    if (!offer) {
        return next(new ApiError_1.default({
            en: "offer not found",
            ar: "العرض غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2- check if offer already exist
    const exist = await offer_model_1.Offer.findOne({ title: title });
    if (exist) {
        return next(new ApiError_1.default({
            en: `this title already used`,
            ar: `هذا العنوان مستخدم بالفعل`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- update offer
    const updatedOffer = await offer_model_1.Offer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    // using bulkOption to add this offer to all products
    const products = await product_model_1.Product.find({ offer: req.params.id });
    const bulkOption = products.map((item) => ({
        updateOne: {
            filter: { _id: item._id },
            update: {
                $set: {
                    priceAfterDiscount: item.priceBeforeDiscount -
                        (item.priceBeforeDiscount * percentage) / 100,
                },
            },
        },
    }));
    await product_model_1.Product.bulkWrite(bulkOption, {});
    // 4- return response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: updatedOffer,
        success_en: "updated successfully",
        success_ar: "تم التعديل بنجاح",
    });
});
// @desc    Delete Specific Offer By Id
// @route   DELETE /api/v1/offers/:id
// @access  Private (User)
exports.deleteOffer = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- check if offer exist and delete it
    const offerDeleted = await offer_model_1.Offer.findByIdAndDelete(req.params.id);
    if (!offerDeleted) {
        return next(new ApiError_1.default({
            en: "offer not found",
            ar: "العرض غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2- using bulkOption to remove this offer from all products
    const products = await product_model_1.Product.find({ offer: req.params.id });
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
    // 3- return response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "deleted successfully",
        success_ar: "تم الحذف بنجاح",
    });
});
