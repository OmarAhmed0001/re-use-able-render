"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketerCreateValidator = void 0;
const joi_1 = __importDefault(require("joi"));
exports.MarketerCreateValidator = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().required(),
    phone: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
    code: joi_1.default.string().required(),
    discount: joi_1.default.number().required(),
    commissionMarketer: joi_1.default.number().required(),
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
    url: joi_1.default.string().required(),
});
