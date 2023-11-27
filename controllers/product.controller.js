"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLikeBySomeOneById = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getAllProductsByCategoryId = exports.getProductById = exports.getAllProducts = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ApiFeatures_1 = require("../utils/ApiFeatures");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const product_model_1 = require("../models/product.model");
const category_model_1 = require("../models/category.model");
const subCategory_model_1 = require("../models/subCategory.model");
const cart_model_1 = require("../models/cart.model");
const review_model_1 = require("../models/review.model");
const order_model_1 = require("../models/order.model");
const comment_model_1 = require("../models/comment.model");
const factory_controller_1 = require("./factory.controller");
const http_status_codes_1 = require("http-status-codes");
const status_enum_1 = require("../interfaces/status/status.enum");
const limitsProduct_1 = require("../utils/limits/limitsProduct");
const MetaData_1 = require("../utils/MetaData");
const notification_1 = require("../utils/notification");
const repository_model_1 = require("../models/repository.model");
const meta_model_1 = require("../models/meta.model");
const checkIfCategoryAndSubCategoryExist = async (categoryId, next) => {
    const isCategoryExist = await category_model_1.Category.findOne({ _id: categoryId });
    if (!isCategoryExist) {
        return next(new ApiError_1.default({
            en: "Category not found",
            ar: "القسم غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
};
const checkIfSubCategoryExist = async (subCategoryId, category, next) => {
    const isSubCategoryExist = await subCategory_model_1.SubCategory.findOne({
        _id: subCategoryId,
        category,
    });
    if (!isSubCategoryExist) {
        return next(new ApiError_1.default({
            en: "SubCategory not found",
            ar: "القسم الفرعي غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
};
// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
exports.getAllProducts = (0, factory_controller_1.getAllItems)(product_model_1.Product, ["attributes", "category", "subCategory", "metaDataId"], "-__v -directDownloadLink");
// @desc      Get product by id
// @route     GET /api/v1/products/:id
// @access    Public
exports.getProductById = (0, factory_controller_1.getOneItemById)(product_model_1.Product, ["attributes", "category", "subCategory", "metaDataId"], "-directDownloadLink");
// @desc      Get all products by category id
// @route     GET /api/v1/products/forSpecificCategory/:categoryId?page=1&limit=10
// @access    Public
exports.getAllProductsByCategoryId = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id form params
    const { categoryId } = req.params;
    const category = await category_model_1.Category.findById(categoryId);
    if (!category) {
        return next(new ApiError_1.default({
            en: "Category not found",
            ar: "القسم غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2- get all products belong to specific category from MongooseDB
    const query = req.query;
    const mongoQuery = product_model_1.Product.find({ category: categoryId });
    // 4- get features
    const { data, paginationResult } = await new ApiFeatures_1.ApiFeatures(mongoQuery, query)
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();
    if (data.length === 0) {
        return next(new ApiError_1.default({
            en: "not found",
            ar: "غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 6- send response
    res.status(200).json({
        status: "success",
        results: data.length,
        paginationResult,
        category,
        data: data,
        success_en: "Successfully",
        success_ar: "تم بنجاح",
    });
});
// @desc      create new product
// @route     POST /api/v1/products
// @access    Private
exports.createProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    const { title_en, title_ar, category } = req.body;
    // 1- check if category and subCategory exist
    await checkIfCategoryAndSubCategoryExist(category, next);
    if (req.body.subCategory)
        await checkIfSubCategoryExist(req.body.subCategory, req.body.category, next);
    // 2- get number of category that exist
    const productCount = await product_model_1.Product.countDocuments();
    const limit = (0, limitsProduct_1.limitedForProduct)();
    if (productCount === limit) {
        return next(new ApiError_1.default({
            en: `you can't add more than ${limit} products`,
            ar: `لا يمكنك إضافة أكثر من ${limit} منتجات`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2- check if product already exist
    const existProduct = await product_model_1.Product.findOne({
        $or: [
            {
                $and: [
                    {
                        $or: [
                            {
                                title_en,
                            },
                            {
                                title_ar,
                            },
                        ],
                    },
                    {
                        category,
                    },
                ],
            },
            {
                $and: [
                    {
                        $or: [
                            {
                                title_en,
                            },
                            {
                                title_ar,
                            },
                        ],
                    },
                    {
                        category,
                    },
                    {
                        subcategory: req.body.subcategory,
                    },
                ],
            },
        ],
    });
    if (existProduct) {
        return next(new ApiError_1.default({
            en: "Product Already Exist",
            ar: "المنتج موجود بالفعل",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- create new product
    const { quantity } = req.body;
    if (quantity === 0 || !quantity) {
        // delete req.body.quantity
        delete req.body.quantity;
    }
    const product = await product_model_1.Product.create(req.body);
    const reference = product._id;
    let MetaData = {};
    // Check if title_meta and desc_meta exist in the request body
    if (req.body.title_meta && req.body.desc_meta) {
        // Assuming createMetaData is an asynchronous function that creates metadata
        MetaData = await (0, MetaData_1.createMetaData)(req, reference);
        await product.updateOne({ metaDataId: MetaData._id });
    }
    // send notification to all users
    const { title, message, receiver, role } = req.body;
    const sender = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).toString(); // add type guard to check if req.user exists
    let notification = {};
    if (title && message && sender && role && receiver) {
        if (receiver === "all") {
            notification = await (0, notification_1.createNotificationAll)(title, message, sender, role);
        }
        else {
            notification = await (0, notification_1.createNotification)(title, message, sender, receiver);
        }
        if (notification === -1) {
            return next(new ApiError_1.default({
                en: "notification not created",
                ar: "لم يتم إنشاء الإشعار",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
    }
    ////////////////////////////////
    // 4- increment subCategoryCount in Category
    await category_model_1.Category.updateOne({ _id: category }, { $inc: { productsCount: 1 } });
    // 5- increment productsCount in SubCategory
    if (req.body.subCategory) {
        await subCategory_model_1.SubCategory.updateOne({ _id: req.body.subCategory }, { $inc: { productsCount: 1 } });
    }
    // 6- send response
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: {
            product,
            MetaData,
            notification,
        },
        success_en: "Product created successfully",
        success_ar: "تم إنشاء المنتج بنجاح",
    });
});
// @desc      update product
// @route     PUT /api/v1/products/:id
// @access    Private
exports.updateProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { category, subCategory } = req.body;
    // 1- check if category and subCategory exist
    if (category)
        await checkIfCategoryAndSubCategoryExist(category, next);
    // 3- check if meta already exist
    const exist = await meta_model_1.Meta.findOne({ reference: id });
    if (!exist && req.body.title_meta && req.body.desc_meta) {
        const newMeta = await (0, MetaData_1.createMetaData)(req, id);
        await product_model_1.Product.findByIdAndUpdate(id, Object.assign({ metaDataId: newMeta._id }, req.body), { new: true });
    }
    else if (exist && req.body.title_meta && req.body.desc_meta) {
        await meta_model_1.Meta.updateOne({ reference: id }, { title_meta: req.body.title_meta, desc_meta: req.body.desc_meta });
    }
    // 2- update product
    const product = await product_model_1.Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) {
        return next(new ApiError_1.default({
            en: "Product not found",
            ar: "المنتج غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: product,
        success_en: "Product updated successfully",
        success_ar: "تم تحديث المنتج بنجاح",
    });
});
// @desc      delete product
// @route     DELETE /api/v1/products/:id
// @access    Private
exports.deleteProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- check if product exist
    const product = await product_model_1.Product.findById(req.params.id);
    if (!product) {
        return next(new ApiError_1.default({
            en: "Product not found",
            ar: "المنتج غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 2- check if product in order
    const order = await order_model_1.Order.findOne({ "orderItems.product": req.params.id });
    if (order) {
        return next(new ApiError_1.default({
            en: "Product in order",
            ar: "المنتج موجود في طلب",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // 3- check if product in cart and delete it
    await cart_model_1.Cart.updateMany({ "cartItems.product": req.params.id }, { $pull: { cartItems: { product: req.params.id } } });
    // 4- delete cart if cartItems is empty
    await cart_model_1.Cart.deleteMany({ cartItems: { $size: 0 } });
    // 5- delete all reviews and comments for this product
    await comment_model_1.Comment.findOneAndDelete({ product: req.params.id });
    await review_model_1.Review.findOneAndDelete({ product: req.params.id });
    const deleted = await (0, MetaData_1.deleteMetaData)(req.params.id);
    if (deleted) {
        // 6- delete product
        await product.deleteOne();
    }
    else {
        return next(new ApiError_1.default({
            en: `this Product can't be deleted because MetaData has not  deleted`,
            ar: ` لا يمكن حذف هذا المنتج لأن البيانات الوصفية لم يتم حذفها`,
        }, http_status_codes_1.StatusCodes.FAILED_DEPENDENCY));
    }
    // 7- increment subCategoryCount in Category
    await category_model_1.Category.updateOne({ _id: product.category }, { $inc: { productsCount: -1 } });
    // 8- increment productsCount in SubCategory
    await subCategory_model_1.SubCategory.updateOne({ _id: product.subCategory }, { $inc: { productsCount: -1 } });
    // 9- Find and update the repository in one go, using $pull to remove the product
    await repository_model_1.Repository.findOneAndUpdate({ "products.productId": req.params.id }, // Find repository where the product is present
    {
        $pull: { products: { productId: req.params.id } },
        $inc: { quantity: -product.quantity },
    }, { new: true } // This ensures that you get the updated document
    );
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "Product deleted successfully",
        success_ar: "تم حذف المنتج بنجاح",
    });
});
// @desc      toggle Like By someOne By Id
// @route     POST /api/v1/products/toggleLike
// @access    Private
exports.toggleLikeBySomeOneById = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get user id from req.user
    const { _id } = req.user;
    // 2- get product from mongooseDB
    const product = await product_model_1.Product.findById(req.params.productId);
    // 3- check if product not found
    if (!product) {
        return next(new ApiError_1.default({
            en: `Not Found Any Product By This Id: ${req.body.id}`,
            ar: `${req.body.id} : id لا يوجد منتج بهذا ال`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 4- check if user already liked this product
    const isUserAlreadyLiked = await product_model_1.Product.findOne({
        likes: {
            $elemMatch: {
                $eq: _id,
            },
        },
    });
    // 5- if user already liked this product => unlike it
    if (isUserAlreadyLiked) {
        await product_model_1.Product.findOneAndUpdate({ _id: req.params.productId }, {
            $pull: { likes: _id },
        }, { new: true });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: status_enum_1.Status.SUCCESS,
            success_en: "Product unliked successfully",
            success_ar: "تم إلغاء الإعجاب بالمنتج بنجاح",
        });
        return;
    }
    // 6- if user not liked this product => like it
    await product_model_1.Product.findOneAndUpdate({ _id: req.params.productId }, {
        $push: { likes: _id },
    }, { new: true });
    // 7- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "Product liked successfully",
        success_ar: "تم الإعجاب بالمنتج بنجاح",
    });
});
