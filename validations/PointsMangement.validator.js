"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postPointsManagementValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const PointsManagementValidation = joi_1.default.object({
    noOfPointsInOneUnit: joi_1.default.number().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.required(),
    }),
    totalPointConversionForOneUnit: joi_1.default.number().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.required(),
    }),
    min: joi_1.default.number().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.required(),
    }),
    max: joi_1.default.number().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.required(),
    }),
    status: joi_1.default.string().valid('static', 'dynamic'),
});
exports.postPointsManagementValidation = PointsManagementValidation.tailor('post');
