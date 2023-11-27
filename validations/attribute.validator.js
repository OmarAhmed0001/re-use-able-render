"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putAttributeValidation = exports.postAttributeValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const attributeValidator = joi_1.default.object({
    key_ar: joi_1.default.string().required(),
    key_en: joi_1.default.string().required(),
    values: joi_1.default.array()
        .min(1)
        .items(joi_1.default.object({
        value_ar: joi_1.default.string().required(),
        value_en: joi_1.default.string().required(),
    }))
        .required(),
});
exports.postAttributeValidation = attributeValidator;
exports.putAttributeValidation = attributeValidator;
