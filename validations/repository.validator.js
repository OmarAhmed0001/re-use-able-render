"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putRepositoryValidation = exports.postRepositoryValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const repositoryValidator = joi_1.default.object({
    name_en: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    name_ar: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    quantity: joi_1.default.number().default(0),
    products: joi_1.default.array().items(joi_1.default.object({
        productId: joi_1.default.string().required(),
        quantity: joi_1.default.number().default(0),
    })),
    address: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
});
exports.postRepositoryValidation = repositoryValidator;
exports.putRepositoryValidation = repositoryValidator;
