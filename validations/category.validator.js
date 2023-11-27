"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putCategoryValidation = exports.postCategoryValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const categoryValidator = joi_1.default.object({
    name_en: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    name_ar: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    image: joi_1.default.string().allow("").optional(),
    title_meta: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    desc_meta: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
});
exports.postCategoryValidation = categoryValidator.tailor("post");
exports.putCategoryValidation = categoryValidator.tailor("put");
