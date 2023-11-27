"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.getAllForUser = exports.getAllForProduct = exports.adminDeleteFromProduct = exports.updateForProductByUser = exports.deleteFromProductByUser = exports.addToProduct = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const status_enum_1 = require("../interfaces/status/status.enum");
const product_model_1 = require("../models/product.model");
const review_model_1 = require("../models/review.model");
const ApiFeatures_1 = require("../utils/ApiFeatures");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
// function to calculating the rating after each updated in reviews
const updateRating = async (productId) => {
    let totalRating = 0;
    let avgRating = 0;
    const productsReviews = await review_model_1.Review.find({ product: productId });
    productsReviews === null || productsReviews === void 0 ? void 0 : productsReviews.map((item) => {
        totalRating += item.rating;
    });
    avgRating =
        productsReviews.length === 0 ? 0 : totalRating / productsReviews.length;
    await product_model_1.Product.findOneAndUpdate({ _id: productId }, { rating: avgRating });
};
// @desc    Add review or comment to product
// @route   POST /api/v1/{review or comment}/product/:productId
// @access  Private (User)
const addToProduct = (Model, modelType) => (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get productId from params
    const { productId } = req.params;
    // 2- get userId from req.user
    const { _id } = req.user;
    // 3- check if user already {review or comment} this product
    const alreadyReviewedOrComment = await Model.findOne({
        user: _id,
        product: productId,
    });
    // 4- check if review already exist update it
    if (alreadyReviewedOrComment) {
        // 4.1- update {review or comment}
        const doc = await Model.findOneAndUpdate({ user: _id, product: productId }, req.body, { new: true });
        // 4.2- update rating from product
        if (modelType === "review")
            updateRating(productId);
        // 4.3- send response
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: status_enum_1.Status.SUCCESS,
            data: doc,
            success_ar: "تم التعديل بنجاح",
            success_en: "updated successfully",
        });
        return;
    }
    // 5- if the review not exist
    // 5.1- create it and save it to MongooseDB
    const doc = await Model.create(Object.assign({ user: _id, product: productId }, req.body));
    // 5.2- update rating from product
    if (modelType === "review")
        updateRating(productId);
    // 5.3- send response
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: doc,
        success_ar: "تم الاضافة بنجاح",
        success_en: "added successfully",
    });
});
exports.addToProduct = addToProduct;
// @desc    Delete review or comment
// @route   DELETE /api/v1/{review or comment}/user/:id
// @access  Private (User)
const deleteFromProductByUser = (Model, modelType) => (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id for review or comment from params
    const { id } = req.params;
    // 2- get id for user from token
    const { _id } = req.user;
    // 3- delete review or comment
    const doc = await Model.findOneAndDelete({
        _id: id,
        user: _id,
    });
    // 4- check if review or comment not exist
    if (!doc) {
        return next(new ApiError_1.default({
            en: "Not Found",
            ar: "غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 5- update the ratings for product
    if (modelType === "review") {
        const review = await review_model_1.Review.findOne({ _id: id, user: _id });
        updateRating(review === null || review === void 0 ? void 0 : review.product);
    }
    // 6- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: doc,
        success_ar: "تم حذف بنجاح",
        success_en: "deleted successfully",
    });
});
exports.deleteFromProductByUser = deleteFromProductByUser;
// @desc    Update review or comment
// @route   PUT /api/v1/{review or comment}/user/:id
// @access  Private (User)
const updateForProductByUser = (Model, modelType) => (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id for review or comment from params
    const { id } = req.params;
    // 2- get id for user from token
    const { _id } = req.user;
    // 3- update review or comment
    const doc = await Model.findOneAndUpdate({
        _id: id,
        user: _id,
    }, req.body, { new: true });
    // 4- check if review or comment not exist
    if (!doc) {
        return next(new ApiError_1.default({
            en: "Not Found",
            ar: "غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 5- update the ratings for product
    if (modelType === "review") {
        const review = await review_model_1.Review.findOne({ _id: id, user: _id });
        updateRating(review === null || review === void 0 ? void 0 : review.product);
    }
    // 6- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: doc,
        success_ar: "تم تعديل التقييم بنجاح",
        success_en: "Review updated successfully",
    });
});
exports.updateForProductByUser = updateForProductByUser;
// @desc    admin delete review or comment
// @route   DELETE /api/v1/{review or comment}/admin/:id
// @access  Private (Admin)
const adminDeleteFromProduct = (Model, modelType) => (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id for review or comment from params
    const { id } = req.params;
    // 2- find and delete review or comment
    const doc = await Model.findOneAndDelete({ _id: id });
    // 3- check if review or comment not exist
    if (!doc) {
        return next(new ApiError_1.default({
            en: "Not Found",
            ar: "غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 4- calculate rating for product
    if (modelType === "review") {
        const review = await review_model_1.Review.findOne({ _id: id });
        updateRating(review === null || review === void 0 ? void 0 : review.product);
    }
    // 5- update the ratings for product
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: doc,
        success_ar: "تم حذف بنجاح",
        success_en: "deleted successfully",
    });
});
exports.adminDeleteFromProduct = adminDeleteFromProduct;
// @desc    Get all review or comment for a product
// @route   GET /api/v1/{review or comment}/product/:productId
// @access  Public
const getAllForProduct = (Model, populate = [""]) => (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a, _b;
    // 1- get productId from params
    const { productId } = req.params;
    // 2- get all reviews or comments for this product
    const query = req.query;
    const mongoQuery = Model.find({ product: productId });
    if (populate.length > 0 && populate[0] !== "") {
        query.populate =
            (query === null || query === void 0 ? void 0 : query.populate) && ((_a = query === null || query === void 0 ? void 0 : query.populate) === null || _a === void 0 ? void 0 : _a.length) > 0
                ? (_b = query.populate) === null || _b === void 0 ? void 0 : _b.concat(populate.join(","))
                : populate.join(",");
    }
    // 3- create pagination
    const { data, paginationResult } = await new ApiFeatures_1.ApiFeatures(mongoQuery, query)
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();
    // 4- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        length: data.length,
        paginationResult,
        data: data,
        success_ar: "تم بنجاح",
        success_en: "retrieved successfully",
    });
});
exports.getAllForProduct = getAllForProduct;
// @desc    Get all for a user
// @route   GET /api/v1/{review or comment}/user/:userId
// @access  Private
const getAllForUser = (Model) => (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get userId from params
    const { userId } = req.params;
    // 2- get all reviews or comments for this user
    const query = req.query;
    const mongoQuery = Model.find({ user: userId });
    // 3- create pagination
    const { data, paginationResult } = await new ApiFeatures_1.ApiFeatures(mongoQuery, query)
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();
    // 5- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        length: data.length,
        paginationResult,
        data: data,
        success_ar: "تم بنجاح",
        success_en: "retrieved successfully",
    });
});
exports.getAllForUser = getAllForUser;
// @desc    Get all review or comment
// @route   GET /api/v1/{review or comment}
// @access  Private (Admin)
const getAll = (Model) => (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- find all reviews or comments from model
    const query = req.query;
    const mongoQuery = Model.find();
    // 2- create pagination
    const { data, paginationResult } = await new ApiFeatures_1.ApiFeatures(mongoQuery, query)
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();
    // 4- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        length: data.length,
        paginationResult,
        data: data,
        success_ar: "تم بنجاح",
        success_en: "retrieved successfully",
    });
});
exports.getAll = getAll;
