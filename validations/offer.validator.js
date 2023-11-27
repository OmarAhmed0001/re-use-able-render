"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferUpdateValidator = exports.OfferCreateValidator = void 0;
const joi_1 = __importDefault(require("joi"));
exports.OfferCreateValidator = joi_1.default.object({
    title: joi_1.default.string().required(),
    percentage: joi_1.default.number().required(),
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date()
        .required()
        .greater(joi_1.default.ref("startDate", { adjust: (startDate) => startDate + 1 })),
    typeOfBanner: joi_1.default.string().valid("vertical", "horizontal").required(),
    imageOfBanner: joi_1.default.string().required(),
    discountDepartment: joi_1.default.object({
        key: joi_1.default.string()
            .valid("allProducts", "products", "categories", "subcategories")
            .required(),
        value: joi_1.default.when("key", {
            is: joi_1.default.string().valid("products", "categories", "subcategories"),
            then: joi_1.default.array().items(joi_1.default.string().required().min(1)),
            otherwise: joi_1.default.array().items(joi_1.default.string()),
        }).required(),
    }).required(),
});
exports.OfferUpdateValidator = joi_1.default.object({
    title: joi_1.default.string().optional(),
    percentage: joi_1.default.number().optional(),
    startDate: joi_1.default.date().optional(),
    endDate: joi_1.default.date().optional(),
    typeOfBanner: joi_1.default.string().valid("vertical", "horizontal").optional(),
    imageOfBanner: joi_1.default.string().optional(),
    discountDepartment: joi_1.default.object({
        key: joi_1.default.string()
            .valid("allProducts", "products", "categories", "subcategories")
            .optional(),
        value: joi_1.default.array().items(joi_1.default.string()),
    }).optional(),
});
