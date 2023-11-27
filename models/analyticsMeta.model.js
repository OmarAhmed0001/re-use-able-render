"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAnalyticsMetaValidator = exports.AnalyticsMeta = void 0;
const mongoose_1 = require("mongoose");
const joi_1 = __importDefault(require("joi"));
const analyticsMetaSchema = new mongoose_1.Schema({
    key: { type: String, enum: ['google', 'snap', 'facebook', 'tiktok', 'tag'] },
    value: String,
});
exports.AnalyticsMeta = (0, mongoose_1.model)("AnalyticsMeta", analyticsMetaSchema);
const AnaylticsMetaValidator = joi_1.default.object({
    key: joi_1.default.string().valid('google', 'snap', 'facebook', 'tiktok', 'tag').alter({
        post: schema => schema.required(),
        put: schema => schema.forbidden(),
    }),
    value: joi_1.default.string().alter({
        post: schema => schema.required(),
        put: schema => schema.forbidden(),
    }),
});
exports.postAnalyticsMetaValidator = AnaylticsMetaValidator.tailor('post');
