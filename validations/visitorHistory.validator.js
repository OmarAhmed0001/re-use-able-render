"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putVisitorHistoryValidation = exports.postVisitorHistoryValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const visitorHistoryValidator = joi_1.default.object({
    count: joi_1.default.string().optional(),
    country: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    ip: joi_1.default.array()
        .min(1)
        .items(joi_1.default.object({
        ip: joi_1.default.string().required(),
    }))
        .required(),
});
exports.postVisitorHistoryValidation = visitorHistoryValidator;
exports.putVisitorHistoryValidation = visitorHistoryValidator;
