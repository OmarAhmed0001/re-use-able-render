"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeOrderStatusValidation = exports.verifyOrderValidation = exports.createOnlineOrderValidation = exports.createOrderValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createOrderValidation = joi_1.default.object({
    city: joi_1.default.string().required(),
    phone: joi_1.default.string().required(),
    name: joi_1.default.string().required(),
    area: joi_1.default.string().required(),
    address: joi_1.default.string().required(),
    postalCode: joi_1.default.string().required(),
    orderNotes: joi_1.default.string().optional(),
    email: joi_1.default.string().email().optional(),
});
exports.createOnlineOrderValidation = joi_1.default.object({
    type: joi_1.default.string().valid("creditcard").required(),
    cvc: joi_1.default.string().length(3).required(),
    month: joi_1.default.number().min(1).max(12).required(),
    year: joi_1.default.string().length(4).required(),
    number: joi_1.default.string().length(16).required(),
    name: joi_1.default.string().required(),
});
exports.verifyOrderValidation = joi_1.default.object({
    code: joi_1.default.string().length(6).required(),
    phone: joi_1.default.string().trim().required(),
});
exports.changeOrderStatusValidation = joi_1.default.object({
    status: joi_1.default.string().valid("in delivery", "delivered", "return").required(),
});
