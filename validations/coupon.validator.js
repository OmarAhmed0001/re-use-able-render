"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponUpdateValidator = exports.CouponCreateValidator = void 0;
const joi_1 = __importDefault(require("joi"));
exports.CouponCreateValidator = joi_1.default.object({
    title: joi_1.default.string().required(),
    code: joi_1.default.string().required(),
    limit: joi_1.default.number().required(),
    discount: joi_1.default.number().required(),
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().required().greater(joi_1.default.ref('startDate', { "adjust": startDate => startDate + 1 })),
    discountDepartment: joi_1.default.object({
        key: joi_1.default.string()
            .valid("allProducts", "products", "categories", "subcategories")
            .required(),
        value: joi_1.default.when('key', {
            is: joi_1.default.string().valid("products", "categories", "subcategories"),
            then: joi_1.default.array().items(joi_1.default.string().required().min(1)),
            otherwise: joi_1.default.array().items(joi_1.default.string())
        }).required()
    }).required(),
});
exports.CouponUpdateValidator = joi_1.default.object({
    title: joi_1.default.string().optional(),
    code: joi_1.default.string().optional(),
    limit: joi_1.default.number().optional(),
    discount: joi_1.default.number().optional(),
    startDate: joi_1.default.date().optional(),
    endDate: joi_1.default.date().required().greater(joi_1.default.ref('startDate', { "adjust": startDate => startDate + 1 })),
    discountDepartment: joi_1.default.object({
        key: joi_1.default.string()
            .valid("allProducts", "products", "categories", "subcategories")
            .optional(),
        value: joi_1.default.array().items(joi_1.default.string()),
    }).optional(),
});
