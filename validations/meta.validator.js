"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const MetaValidator = joi_1.default.object({
    title_meta: joi_1.default.string().optional(),
    desc_meta: joi_1.default.string().optional(),
});
exports.MetaValidation = MetaValidator;
