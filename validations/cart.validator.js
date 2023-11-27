"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCartValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addToCartValidation = joi_1.default.object({
    quantity: joi_1.default.number().min(1).required(),
    properties: joi_1.default.array()
        .min(1)
        .items(joi_1.default.object({
        key_en: joi_1.default.string().required(),
        key_ar: joi_1.default.string().required(),
        value_en: joi_1.default.string().required(),
        value_ar: joi_1.default.string().required(),
    }))
        .optional(),
});
