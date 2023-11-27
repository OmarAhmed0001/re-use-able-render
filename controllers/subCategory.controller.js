"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategoryById = exports.updateSubCategoryById = exports.createSubCategory = exports.getAllSubCategoriesByCategoryId = exports.getSubCategoryById = exports.getAllSubCategories = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const subCategory_model_1 = require("../models/subCategory.model");
const category_model_1 = require("../models/category.model");
const factory_controller_1 = require("./factory.controller");
const status_enum_1 = require("../interfaces/status/status.enum");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const product_model_1 = require("../models/product.model");
const ApiFeatures_1 = require("../utils/ApiFeatures");
const limitsSubCategory_1 = require("../utils/limits/limitsSubCategory");
const MetaData_1 = require("../utils/MetaData");
const meta_model_1 = require("../models/meta.model");
// @desc    Get All SubCategories
// @route   GET /api/v1/subCategories
// @access  Public
exports.getAllSubCategories = (0, factory_controller_1.getAllItems)(subCategory_model_1.SubCategory, ["metaDataId"]);
// @desc Get SubCategory By Id
// @route GET /api/v1/subCategories/:id
// @access Public
exports.getSubCategoryById = (0, factory_controller_1.getOneItemById)(subCategory_model_1.SubCategory, ["metaDataId"]);
// @desc Get All SubCategories belong to specific category
// @route GET /api/v1/subCategories/forSpecificCategory/:categoryId
// @access Public
exports.getAllSubCategoriesByCategoryId = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id from params
    const { categoryId } = req.params;
    // 2- get all subcategories belong to specific category from mongooseDB
    const query = req.query;
    const mongoQuery = subCategory_model_1.SubCategory.find({ category: categoryId });
    // 3- create pagination
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
    // 5- send response
    res.status(200).json({
        status: status_enum_1.Status.SUCCESS,
        length: data.length,
        paginationResult,
        data: data,
        success_en: "Successfully",
        success_ar: "تم بنجاح",
    });
});
// @desc Create subcategory inside specific category
// @route POST /api/v1/subCategories/:categoryId
// @access Private (Admin)
exports.createSubCategory = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get data from body
    const { name_en, name_ar, image, category } = req.body;
    // 2- check if category already exist and get number of subcategory that exist in it category
    const categoryExist = await category_model_1.Category.findById(category);
    if (!categoryExist) {
        return next(new ApiError_1.default({
            en: `this category not exist`,
            ar: `هذا التصنيف غير موجود`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    if (categoryExist.subCategoriesCount === (0, limitsSubCategory_1.limitedForSubCategory)()) {
        return next(new ApiError_1.default({
            en: `you can't add more than ${(0, limitsSubCategory_1.limitedForSubCategory)()} subcategories in each category`,
            ar: `لا يمكنك إضافة أكثر من ${(0, limitsSubCategory_1.limitedForSubCategory)()} تصنيفات فرعية في كل تصنيف`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- check if subcategory already exist
    const exist = await subCategory_model_1.SubCategory.findOne({
        $and: [{ $or: [{ name_en }, { name_ar }] }, { category }],
    });
    if (exist) {
        return next(new ApiError_1.default({
            en: `this subcategory already exist`,
            ar: `هذا التصنيف الفرعي موجود بالفعل`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 4- create subcategory inside specific category in mongooseDB
    const newSubCategory = await subCategory_model_1.SubCategory.create({
        name_en,
        name_ar,
        image,
        category,
    });
    // 5- create MetaData for subCategory
    const reference = newSubCategory._id;
    let dataRes = {
        newSubCategory,
        MetaData: {},
    };
    if (req.body.title_meta && req.body.desc_meta) {
        const MetaData = await (0, MetaData_1.createMetaData)(req, reference);
        await newSubCategory.updateOne({ metaDataId: MetaData._id });
        dataRes = {
            newSubCategory,
            MetaData,
        };
    }
    // 6- increment subCategoryCount in Category
    await category_model_1.Category.updateOne({ _id: category }, { $inc: { subCategoriesCount: 1 } });
    // 7- send response
    res.status(201).json({
        status: "success",
        data: dataRes,
        success_en: "Successfully",
        success_ar: "تم بنجاح",
    });
});
// @desc Update specific subcategory using id
// @route PUT /api/v1/subCategories/:id
// @access Private (Admin)
exports.updateSubCategoryById = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id for item from params
    const { id } = req.params;
    // 2- find SubCategory already exist in mongooseDB
    const subcategory = await subCategory_model_1.SubCategory.findById(id);
    if (!subcategory) {
        return next(new ApiError_1.default({
            en: `Not Found Any Result For This Id ${id}`,
            ar: `${id}لا يوجداي نتيجة لهذا`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- check if Meta already exist
    const exist = await meta_model_1.Meta.findOne({ reference: id });
    if (!exist && req.body.title_meta && req.body.desc_meta) {
        const newMeta = await (0, MetaData_1.createMetaData)(req, id);
        await subCategory_model_1.SubCategory.findByIdAndUpdate(id, Object.assign({ metaDataId: newMeta._id }, req.body), { new: true });
    }
    else if (exist && req.body.title_meta && req.body.desc_meta) {
        await meta_model_1.Meta.updateOne({ reference: id }, { title_meta: req.body.title_meta, desc_meta: req.body.desc_meta });
        await subCategory_model_1.SubCategory.findByIdAndUpdate(id, Object.assign({}, req.body), { new: true });
    }
    else {
        await subCategory_model_1.SubCategory.findByIdAndUpdate(id, Object.assign({}, req.body), { new: true });
    }
    // 4- get updated document and populate it
    const document = await subCategory_model_1.SubCategory.findById(id).populate("metaDataId");
    // 5- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: document,
        success_en: "updated successfully",
        success_ar: "تم التعديل بنجاح",
    });
});
// @desc Delete specific subcategory By Id
// @route DELETE /api/v1/subCategories/:id
// @access Private (Admin)
exports.deleteSubCategoryById = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id from params
    const { id } = req.params;
    // 2- check if subcategory contained any products
    const productCount = await product_model_1.Product.countDocuments({
        subCategory: Object(id),
    });
    if (productCount > 0) {
        return next(new ApiError_1.default({
            en: `this subcategory can't be deleted because it's contained ${productCount} products`,
            ar: `لا يمكن حذف هذا التصنيف الفرعي لأنه يحتوي على ${productCount} منتج`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const deleted = await (0, MetaData_1.deleteMetaData)(id);
    if (deleted) {
        // 4- delete subcategory by id from mongooseDB
        const deletedSubCategory = await subCategory_model_1.SubCategory.findByIdAndDelete(id);
        // 3- increment subCategoryCount in Category
        await category_model_1.Category.updateOne({ _id: deletedSubCategory === null || deletedSubCategory === void 0 ? void 0 : deletedSubCategory.category }, { $inc: { subCategoriesCount: -1 } });
    }
    else {
        return next(new ApiError_1.default({
            en: `this subcategory can't be deleted because MetaData has not  deleted`,
            ar: ` لا يمكن حذف هذا التصنيف الفرعي لأن البيانات الوصفية لم يتم حذفها`,
        }, http_status_codes_1.StatusCodes.FAILED_DEPENDENCY));
    }
    // 5- send response
    res.status(200).json({
        status: "success",
        success_en: "Deleted Successfully",
        success_ar: "تم الحذف بنجاح",
    });
});
