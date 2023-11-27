"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllItemsFromAllFavouritesList = exports.toggleProductFromFavouritesList = exports.removeProductFromFavouritesList = exports.getFavouriteList = exports.addProductToFavouritesList = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const product_model_1 = require("../models/product.model");
const status_enum_1 = require("../interfaces/status/status.enum");
const user_model_1 = require("../models/user.model");
// @desc     Add Product To FavouritesList
// @route    POST  /api/v1/favourites/
// @access   Protected/User
exports.addProductToFavouritesList = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- check if product exist
    const productExist = await product_model_1.Product.findById(req.body.productId);
    if (!productExist) {
        return next(new ApiError_1.default({
            en: `Product Not Found`,
            ar: `المنتج غير موجود`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2- check if product already in favourite list
    // $addToSet => Add ProductId To Favourite Array
    const userFavouriteList = await user_model_1.User.findByIdAndUpdate(req.user._id, {
        $addToSet: { favourite: req.body.productId },
    }, {
        new: true,
    });
    // 3- send response
    res.status(200).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "add successfully",
        success_ar: "تم الاضافة بنجاح",
    });
});
// @desc     Get FavouritesList For Logged User
// @route    GET  /api/v1/favourites/
// @access   Protected/User
exports.getFavouriteList = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get user favourite list
    let userFavouriteList = await user_model_1.User.findById(req.user._id).populate('favourite').select('favourite');
    const { keyword } = req.query;
    let searchData = (userFavouriteList === null || userFavouriteList === void 0 ? void 0 : userFavouriteList.favourite) || [];
    if (keyword) {
        searchData = (userFavouriteList === null || userFavouriteList === void 0 ? void 0 : userFavouriteList.favourite.filter((item) => {
            const typedItem = item;
            const titleEn = typedItem === null || typedItem === void 0 ? void 0 : typedItem.title_en; // Get the title_en property
            const titleAr = typedItem === null || typedItem === void 0 ? void 0 : typedItem.title_ar;
            const descriptionEn = typedItem === null || typedItem === void 0 ? void 0 : typedItem.description_en;
            const descriptionAr = typedItem === null || typedItem === void 0 ? void 0 : typedItem.description_ar;
            const valueTitleEn = Object.values(keyword)[0];
            const valueTitleAr = Object.values(keyword)[1];
            const valueDescEn = Object.values(keyword)[2];
            const valueDescAr = Object.values(keyword)[3];
            if ((titleEn === null || titleEn === void 0 ? void 0 : titleEn.toLowerCase().includes(valueTitleEn.toLowerCase())) || (titleAr === null || titleAr === void 0 ? void 0 : titleAr.toLowerCase().includes(valueTitleAr.toLowerCase())) || (descriptionEn === null || descriptionEn === void 0 ? void 0 : descriptionEn.toLowerCase().includes(valueDescEn.toLowerCase())) || (descriptionAr === null || descriptionAr === void 0 ? void 0 : descriptionAr.toLowerCase().includes(valueDescAr.toLowerCase())))
                return true;
            return false;
        })) || [];
    }
    const result = {
        "_id": userFavouriteList === null || userFavouriteList === void 0 ? void 0 : userFavouriteList._id,
        "favourite": searchData,
        "imageUrl": userFavouriteList === null || userFavouriteList === void 0 ? void 0 : userFavouriteList.imageUrl,
        "id": userFavouriteList === null || userFavouriteList === void 0 ? void 0 : userFavouriteList.id,
    };
    // 2- send response
    res.status(200).json({
        status: status_enum_1.Status.SUCCESS,
        data: result,
        success_en: "add successfully",
        success_ar: "تم الاضافة بنجاح",
    });
});
// @desc     Remove Product From FavouritesList
// @route    DELETE  /api/v1/favourites/:productId
// @access   Protected/User
exports.removeProductFromFavouritesList = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- $pull => Remove ProductId From FavouritesList Array
    await user_model_1.User.findByIdAndUpdate(req.user._id, {
        $pull: { favourite: req.params.productId },
    }, {
        new: true,
    });
    // 2- send response
    res.status(200).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "deleted successfully",
        success_ar: "تم الحذف بنجاح",
    });
});
// @desc     Toggle Product From FavouritesList
// @route    PUT  /api/v1/favourites/toggleItemToFavourites
// @access   Protected/User
exports.toggleProductFromFavouritesList = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- inital values
    let isExist = false;
    let megEn = "";
    let megAr = "";
    // 2- get user favourite list
    const userFavouriteList = await user_model_1.User.findById(req.user._id).select('favourite');
    // 3- check if product exist in user favourite list
    userFavouriteList === null || userFavouriteList === void 0 ? void 0 : userFavouriteList.favourite.forEach((item) => {
        if (item == req.params.productId) {
            isExist = true;
        }
    });
    // 4- if product exist in user favourite list => remove it
    if (isExist) {
        await user_model_1.User.findByIdAndUpdate(req.user._id, {
            $pull: { favourite: req.params.productId },
        }, {
            new: true,
        });
        megEn = "deleted successfully";
        megAr = "تم الحذف بنجاح";
    }
    else {
        await user_model_1.User.findByIdAndUpdate(req.user._id, {
            $addToSet: { favourite: req.params.productId },
        }, {
            new: true,
        });
        megEn = "add successfully";
        megAr = "تم الاضافة بنجاح";
    }
    // 5- send response
    res.status(200).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: megEn,
        success_ar: megAr,
    });
});
// @desc     Get All Products For All Users
// @route    GET  /api/v1/favourites/
// @access   Protected/User
exports.getAllItemsFromAllFavouritesList = (0, express_async_handler_1.default)(async (req, res, next) => {
    const products = await user_model_1.User.find().select('favourite');
    const map1 = new Map();
    const result = products.filter((prod) => {
        if (prod.favourite.length > 0) {
            return prod.favourite;
        }
    });
    for (let i = 0; i < result.length; i += 1) {
        const len = result[i].favourite.length;
        for (let j = 0; j < len; j += 1) {
            const id = result[i].favourite[j].toString();
            if (map1.get(id) === undefined) {
                map1.set(id, 0);
            }
            map1.set(id, map1.get(id) + 1);
        }
    }
    const arrayFromMap = Array.from(map1);
    // send respone
    res.status(200).json({
        status: status_enum_1.Status.SUCCESS,
        data: arrayFromMap,
        success_en: "success",
        success_ar: "تم بنجاح",
    });
});
