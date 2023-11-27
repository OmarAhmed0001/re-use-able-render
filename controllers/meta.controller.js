"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaByRefrence = exports.updateMeta = exports.getMetaById = exports.getAllMetas = void 0;
const factory_controller_1 = require("./factory.controller");
const meta_model_1 = require("../models/meta.model");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
// @desc    Get All Metas
// @route   POST /api/v1/metas
// @access  public (Admin)
exports.getAllMetas = (0, factory_controller_1.getAllItems)(meta_model_1.Meta);
// @desc    Get Specific Meta By Id
// @route   POST /api/v1/metas/:id
// @access  Private (Admin)
exports.getMetaById = (0, factory_controller_1.getOneItemById)(meta_model_1.Meta);
// @desc    Update Meta By Id
// @route   POST /api/v1/metas/:id
// @access  Private (Admin)
exports.updateMeta = (0, factory_controller_1.updateOneItemById)(meta_model_1.Meta);
// @desc    Get Meta By Refrence
// @route   POST /api/v1/metas/:id
// @access  public (Admin)
exports.getMetaByRefrence = (0, express_async_handler_1.default)(async (req, res) => {
    meta_model_1.Meta.findOne({ reference: req.params.id })
        .then((data) => {
        return res
            .status(200)
            .json({
            message_en: "meta Fetched Successfully",
            message_ar: "تمت جلب البيانات  بنجاح",
            data,
        });
    })
        .catch((e) => {
        return res
            .status(400)
            .json({
            error_en: "Meta Not Found",
            error_ar: "لم يتم العثور على الميتا",
        });
    });
});
