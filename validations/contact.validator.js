"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postContactValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const contactValidator = joi_1.default.object({
    name: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    message: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    email: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    phone: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    isOpened: joi_1.default.boolean().optional(),
    contactType: joi_1.default.string()
        .valid("complaints", "suggestions", "customerService")
        .alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
});
exports.postContactValidation = contactValidator.tailor("post");
