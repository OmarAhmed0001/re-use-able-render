"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogUpdateValidator = exports.BlogCreateValidator = void 0;
const joi_1 = __importDefault(require("joi"));
exports.BlogCreateValidator = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    image: joi_1.default.string().required(),
});
exports.BlogUpdateValidator = joi_1.default.object({
    title: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    image: joi_1.default.string().optional(),
});
