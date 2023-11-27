"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewToProductValidator = exports.addReviewToProductValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const reviewSchemaValidator = joi_1.default.object({
    comment: joi_1.default.string().optional(),
    rating: joi_1.default.number()
        .min(1)
        .max(5)
        .alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
});
exports.addReviewToProductValidator = reviewSchemaValidator.tailor("post");
exports.updateReviewToProductValidator = reviewSchemaValidator.tailor("put");
