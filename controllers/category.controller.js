"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategoriesWithSubCategories = exports.getAllCategoriesWithProducts = exports.getCategoryById = exports.getAllCategories = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const product_model_1 = require("../models/product.model");
const subCategory_model_1 = require("../models/subCategory.model");
const category_model_1 = require("./../models/category.model");
const status_enum_1 = require("../interfaces/status/status.enum");
const ApiFeatures_1 = require("../utils/ApiFeatures");
const limitsCategory_1 = require("../utils/limits/limitsCategory");
const factory_controller_1 = require("./factory.controller");
const MetaData_1 = require("../utils/MetaData");
const meta_model_1 = require("../models/meta.model");
// @desc     Get All Categories
// @route    GET/api/v1/categories
// @access   Public
exports.getAllCategories = (0, factory_controller_1.getAllItems)(category_model_1.Category, ["metaDataId"]);
// @desc     Get Specific Category By Id
// @route    GET/api/v1/categories/:id
// @access   Public
exports.getCategoryById = (0, factory_controller_1.getOneItemById)(category_model_1.Category, ["metaDataId"]);
// @desc     Get All Categories
// @route    GET/api/v1/categories/getAllCategoriesWithProducts
// @access   Public
exports.getAllCategoriesWithProducts = (0, express_async_handler_1.default)(async (req, res, next) => {
    let category = await category_model_1.Category.find();
    // category => products => [{category: ca, products}]
    let result = [];
    await Promise.all(category.map(async (cat) => {
        const mongoQuery = product_model_1.Product.find({ category: cat._id.toString() });
        const query = req.query;
        const { data } = await new ApiFeatures_1.ApiFeatures(mongoQuery, query)
            .populate()
            .filter()
            .limitFields()
            .search()
            .sort()
            .paginate();
        // 3- get features
        if (data.length === 0) {
            return;
        }
        result.push({
            category: cat,
            products: data,
        });
    }));
    result = result.sort((a, b) => a.products.length < b.products.length ? 1 : -1);
    res.status(200).json({
        status: "success",
        data: result,
        success_en: "Successfully",
        success_ar: "تم بنجاح",
    });
});
// @desc     Get All Categories
// @route    GET/api/v1/categories/getAllCategoriesWithProducts
// @access   Public
exports.getAllCategoriesWithSubCategories = (0, express_async_handler_1.default)(async (req, res, next) => {
    let category = await category_model_1.Category.find();
    // category => products => [{category: ca, products}]
    let result = [];
    await Promise.all(category.map(async (cat) => {
        const mongoQuery = subCategory_model_1.SubCategory.find({ category: cat._id.toString() });
        const query = req.query;
        const { data } = await new ApiFeatures_1.ApiFeatures(mongoQuery, query)
            .populate()
            .filter()
            .limitFields()
            .search()
            .sort()
            .paginate();
        // 3- get features
        result.push({
            category: cat,
            subCategories: data,
        });
    }));
    result = result.sort((a, b) => a.subCategories.length < b.subCategories.length ? 1 : -1);
    res.status(200).json({
        status: "success",
        data: result,
        success_en: "Successfully",
        success_ar: "تم بنجاح",
    });
});
// @desc     Create New Category
// @route    POST/api/v1/categories
// @access   Private (Admins) TODO: add the rest of the roles
exports.createCategory = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get data from body
    const { name_en, name_ar, image } = req.body;
    // 2- get number of category that exist
    const categoryCount = await category_model_1.Category.countDocuments();
    if (categoryCount === (0, limitsCategory_1.limitedForCategory)()) {
        return next(new ApiError_1.default({
            en: `you can't add more than ${(0, limitsCategory_1.limitedForCategory)()} categories`,
            ar: `لا يمكنك إضافة أكثر من ${(0, limitsCategory_1.limitedForCategory)()} تصنيفات`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- check if category already exist
    const exist = await category_model_1.Category.findOne({
        $or: [{ name_en: name_en }, { name_ar: name_ar }],
    });
    if (exist) {
        return next(new ApiError_1.default({
            en: `this category already exist`,
            ar: `هذا التصنيف موجود بالفعل`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 4- create category in mongooseDB
    const newCategory = await category_model_1.Category.create({
        name_en,
        name_ar,
        image,
    });
    const reference = newCategory._id;
    let dataRes = {
        newCategory,
        MetaData: {}
    };
    if (req.body.title_meta && req.body.desc_meta) {
        const MetaData = await (0, MetaData_1.createMetaData)(req, reference);
        await newCategory.updateOne({ metaDataId: MetaData._id });
        dataRes = {
            newCategory,
            MetaData
        };
    }
    // 5- send response
    res.status(201).json({
        status: "success",
        data: dataRes,
        success_en: "created successfully",
        success_ar: "تم الانشاء بنجاح",
    });
});
// @desc     Update Specific Category By Id
// @route    PUT/api/v1/categories/:id
// @access   Private (Admins) TODO: add the rest of the roles
exports.updateCategory = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id for item from params
    const { id } = req.params;
    // 2- check if category not exist
    const category = await category_model_1.Category.findById(id);
    if (!category) {
        return next(new ApiError_1.default({
            en: `Not Found Any Category With This Id: ${id}`,
            ar: `لا يوجد تصنيف بهذا الرقم : ${id}`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    //  3- check if meta already exist
    const exist = await meta_model_1.Meta.findOne({ reference: id });
    if (!exist && req.body.title_meta && req.body.desc_meta) {
        const newMeta = await (0, MetaData_1.createMetaData)(req, id);
        await category_model_1.Category.findByIdAndUpdate(id, Object.assign({ metaDataId: newMeta._id }, req.body), { new: true });
    }
    else if (exist && req.body.title_meta && req.body.desc_meta) {
        await meta_model_1.Meta.updateOne({ reference: id }, { title_meta: req.body.title_meta, desc_meta: req.body.desc_meta });
        await category_model_1.Category.findByIdAndUpdate(id, Object.assign({}, req.body), { new: true });
    }
    else {
        await category_model_1.Category.findByIdAndUpdate(id, Object.assign({}, req.body), { new: true });
    }
    // 4 - get updated document and populate it
    const document = await category_model_1.Category.findById(id).populate("metaDataId");
    // 5- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: document,
        success_en: "updated successfully",
        success_ar: "تم التعديل بنجاح",
    });
});
// @desc     Delete Specific Category By Id
// @route    DELETE/api/v1/categories/:id
// @access   Private (Admins) TODO: add the rest of the roles
exports.deleteCategory = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    // check if category contained any subcategories
    const subCategoryCount = await subCategory_model_1.SubCategory.countDocuments({
        category: Object(id),
    });
    if (subCategoryCount) {
        return next(new ApiError_1.default({
            en: `this category can't be deleted because it has subcategories`,
            ar: `لا يمكن حذف هذا التصنيف لأنه يحتوي على أقسام فرعية`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // check if category contained any products
    const productCount = await product_model_1.Product.countDocuments({ category: Object(id) });
    if (productCount) {
        return next(new ApiError_1.default({
            en: `this category can't be deleted because it has products`,
            ar: `لا يمكن حذف هذا التصنيف لأنه يحتوي على منتجات`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const deleted = await (0, MetaData_1.deleteMetaData)(id);
    if (deleted) {
        await category_model_1.Category.findByIdAndDelete(id);
    }
    else {
        return next(new ApiError_1.default({
            en: `this category can't be deleted because MetaData has not  deleted`,
            ar: ` لا يمكن حذف هذا التصنيف لأن البيانات الوصفية لم يتم حذفها`,
        }, http_status_codes_1.StatusCodes.FAILED_DEPENDENCY));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "deleted successfully",
        success_ar: "تم الحذف بنجاح",
    });
});
