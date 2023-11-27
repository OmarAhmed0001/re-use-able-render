"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnalyticsMeta = exports.createAnalyticsMeta = exports.getAnalyticsMeta = exports.getAllAnalyticsMeta = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const analyticsMeta_model_1 = require("../models/analyticsMeta.model");
const http_status_codes_1 = require("http-status-codes");
const status_enum_1 = require("../interfaces/status/status.enum");
const factory_controller_1 = require("./factory.controller");
// @desc     Get All Analytics Meta
// @route    Get/api/v1/analyticsMeta
// @access   Private (Admins) 
exports.getAllAnalyticsMeta = (0, factory_controller_1.getAllItems)(analyticsMeta_model_1.AnalyticsMeta);
// @desc     Get  Analytics Meta By Id
// @route    Get/api/v1/analyticsMeta/:id
// @access   Private (Admins) 
exports.getAnalyticsMeta = (0, factory_controller_1.getOneItemById)(analyticsMeta_model_1.AnalyticsMeta);
// @desc     Create Analytics Meta
// @route    Post/api/v1/analyticsMeta
// @access   Private (Admins) 
exports.createAnalyticsMeta = (0, express_async_handler_1.default)(async (req, res) => {
    console.log('What is the sent Body: ', req.body);
    const AnalyticsMetaExist = await analyticsMeta_model_1.AnalyticsMeta.findOne({ key: req.body.key });
    if (AnalyticsMetaExist) {
        console.log('this should be true: ', AnalyticsMetaExist);
        const other = await analyticsMeta_model_1.AnalyticsMeta.findByIdAndUpdate(AnalyticsMetaExist === null || AnalyticsMetaExist === void 0 ? void 0 : AnalyticsMetaExist._id, Object.assign({}, req.body), { new: true });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: status_enum_1.Status.SUCCESS,
            data: other,
            success_en: "updated successfully",
            success_ar: "تم التعديل بنجاح",
        });
    }
    else {
        const newOther = new analyticsMeta_model_1.AnalyticsMeta(Object.assign({}, req.body));
        await newOther.save();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: status_enum_1.Status.SUCCESS,
            data: newOther,
            success_en: "created successfully",
            success_ar: "تم الانشاء بنجاح",
        });
    }
});
// @desc     Delete Analytics Meta By Id
// @route    Delete/api/v1/analyticsMeta/:id
// @access   Private (Admins) 
exports.deleteAnalyticsMeta = (0, factory_controller_1.deleteOneItemById)(analyticsMeta_model_1.AnalyticsMeta);
