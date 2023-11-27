"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putNotificationValidation = exports.postNotificationValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const notificationValidator = joi_1.default.object({
    title: joi_1.default.string()
        .alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    message: joi_1.default.string()
        .alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    read: joi_1.default.boolean()
        .alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    sender: joi_1.default.string()
        .hex()
        .length(24)
        .alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    receiver: joi_1.default.string()
        .min(3)
        .alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
});
exports.postNotificationValidation = notificationValidator.tailor("post");
exports.putNotificationValidation = notificationValidator.tailor("put");
