"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSection = exports.updateSection = exports.createSection = exports.getSectionByName = exports.getSectionById = exports.getAllSections = void 0;
const section_model_1 = require("../models/section.model");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const ApiFeatures_1 = require("../utils/ApiFeatures");
const status_enum_1 = require("../interfaces/status/status.enum");
const MetaData_1 = require("../utils/MetaData");
const meta_model_1 = require("../models/meta.model");
// @desc    Get All Sections
// @route   GET /api/v1/sections
// @access  Public
exports.getAllSections = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a, _b;
    // 1- get all Querys
    const filterationOptions = req.query.type ? { type: req.query.type } : {};
    // 2- Get all sections
    const query = req.query;
    const mongoQuery = section_model_1.Section.find();
    query.populate = ((query === null || query === void 0 ? void 0 : query.populate) && ((_a = query === null || query === void 0 ? void 0 : query.populate) === null || _a === void 0 ? void 0 : _a.length) > 0) ? (_b = query.populate) === null || _b === void 0 ? void 0 : _b.concat('metaDataId') : 'metaDataId';
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
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        length: data.length,
        paginationResult,
        data: data,
        success_en: "sections are fetched successfully",
        success_ar: "تم جلب الأقسام بنجاح",
    });
});
// @desc    Get Section By Id
// @route   GET /api/v1/sections/:id
// @access  Public
exports.getSectionById = (0, express_async_handler_1.default)(async (req, res, next) => {
    const section = await section_model_1.Section.findById(req.params.id).populate('metaDataId');
    if (!section) {
        return next(new ApiError_1.default({ en: "Section Cant Be Found", ar: "لا يمكن العثور على القسم" }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        success_en: "section is not existed or delete successfully",
        success_ar: "القسم غير موجود أو تم حذفه",
        data: section,
    });
});
// @desc    Get Section By Name
// @route   GET /api/v1/sections/sectionName/:sectionName
// @access  Public
exports.getSectionByName = (0, express_async_handler_1.default)(async (req, res, next) => {
    const section = await section_model_1.Section.findOne({ title_en: req.params.sectionName });
    if (!section) {
        return next(new ApiError_1.default({ en: "Section Cant Be Found", ar: "لا يمكن العثور على القسم" }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        success_en: "section is not existed or delete successfully",
        success_ar: "القسم غير موجود أو تم حذفه",
        data: section,
    });
});
// @desc    Create Section
// @route   POST /api/v1/sections
// @access  Private (Root) TODO: add the rest of the roles
exports.createSection = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { type, alignment } = req.body;
    if (!type) {
        return next(new ApiError_1.default({ en: "Type is required", ar: "النوع مطلوب" }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    let filterationObject = {};
    if (type) {
        filterationObject = { type };
    }
    if (alignment) {
        filterationObject = Object.assign(Object.assign({}, filterationObject), { alignment });
    }
    if (type == "banner" ||
        type == "aboutus" ||
        type == "privacy" ||
        type == "usage" ||
        type == "retrieval" ||
        type == "public") {
        // CHECK IF THERE IS SECTION WITH THE SAME TYPE OR NOT
        const sectionExist = await section_model_1.Section.findOne(filterationObject);
        if (sectionExist) {
            //UPDATE WARNING
            const updateSection = await section_model_1.Section.findByIdAndUpdate(sectionExist._id, Object.assign({}, req.body), { new: true });
            if (!updateSection) {
                return next(new ApiError_1.default({ en: "Section Cant Be Found", ar: "لا يمكن العثور على القسم" }, http_status_codes_1.StatusCodes.BAD_REQUEST));
            }
            let dataRes = {
                updateSection,
                MetaData: {}
            };
            if (req.body.title_meta && req.body.desc_meta) {
                const MetaData = await (0, MetaData_1.createMetaData)(req, sectionExist._id);
                await updateSection.updateOne({ metaDataId: MetaData._id });
                dataRes = {
                    updateSection,
                    MetaData
                };
            }
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                success_en: `Section ${type} updated Successfully `,
                success_ar: `${type} تم تحديث القسم بنجاح`,
                data: dataRes,
            });
        }
        else {
            const section = new section_model_1.Section(Object.assign({}, req.body));
            section.save();
            const reference = section._id;
            let dataRes = {
                section,
                MetaData: {}
            };
            if (req.body.title_meta && req.body.desc_meta) {
                const MetaData = await (0, MetaData_1.createMetaData)(req, reference);
                await section.updateOne({ metaDataId: MetaData._id });
                dataRes = {
                    section,
                    MetaData
                };
            }
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                success_en: "Section Added Successfully",
                success_ar: "تمت إضافة القسم بنجاح",
                data: dataRes,
            });
        }
    }
    else {
        const section = new section_model_1.Section(Object.assign({}, req.body));
        section.save();
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            success_en: "Section Added Successfully",
            success_ar: "تمت إضافة القسم بنجاح",
            data: section,
        });
    }
});
// @desc    Update Section
// @route   PUT /api/v1/sections/:id
// @access  Private (Root) TODO: add the rest of the roles
exports.updateSection = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- check if section exist
    const { id } = req.params;
    // 2- check if section exist
    const section = await section_model_1.Section.findById(id);
    if (!section) {
        return next(new ApiError_1.default({
            en: "Section Cant Be Updated Cause it's not Found",
            ar: "لا يمكن تحديث القسم لأنه غير موجود",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // 3- check if meta already exist
    const exist = await meta_model_1.Meta.findOne({ reference: id });
    if (!exist && (req.body.title_meta && req.body.desc_meta)) {
        const newMeta = await (0, MetaData_1.createMetaData)(req, id);
        await section_model_1.Section.findByIdAndUpdate(id, Object.assign({ metaDataId: newMeta._id }, req.body), { new: true });
    }
    else if (exist && (req.body.title_meta && req.body.desc_meta)) {
        await meta_model_1.Meta.updateOne({ reference: id }, { title_meta: req.body.title_meta, desc_meta: req.body.desc_meta });
        await section_model_1.Section.findByIdAndUpdate(id, Object.assign({}, req.body), { new: true });
    }
    else {
        await section_model_1.Section.findByIdAndUpdate(id, Object.assign({}, req.body), { new: true });
    }
    // 4- get updated document and populate it
    const document = await section_model_1.Section.findById(id).populate("metaDataId");
    // 5- send response
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: document,
        success_en: "section updated successfully",
        success_ar: "تم تحديث القسم بنجاح",
    });
});
// @desc    Delete Section
// @route   DELETE /api/v1/sections/:id
// @access  Private (Root) TODO: add the rest of the roles
exports.deleteSection = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id for item from params
    const { id } = req.params;
    // 2- find item and delete in mongooseDB
    const section = await section_model_1.Section.findByIdAndDelete(id);
    // 3- check if item deleted
    if (!section) {
        return next(new ApiError_1.default({
            en: `Not Found Any Section For This Id ${id}`,
            ar: `${id}لا يوجداي نتيجة لهذا`,
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 4- delete meta data
    await meta_model_1.Meta.findOneAndDelete({ reference: id });
    // 4- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "deleted successfully",
        success_ar: "تم الحذف بنجاح",
    });
});
