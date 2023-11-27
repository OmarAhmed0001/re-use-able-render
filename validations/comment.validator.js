"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentToProductValidator = exports.addCommentToProductValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const commentSchemaValidator = joi_1.default.object({
    comment: joi_1.default.string().required(),
});
exports.addCommentToProductValidator = commentSchemaValidator;
exports.updateCommentToProductValidator = commentSchemaValidator;
